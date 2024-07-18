// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

#![allow(clippy::arithmetic_side_effects)]

use crate::prelude::*;

pub type ScryptoUnitEnv = Environment<ScryptoUnitEnvironmentSpecifier>;

pub trait EnvironmentSpecifier {
    // Environment
    type Environment;

    // Components
    type Fidenaro;
    type SimpleOracle;
    type RadiswapPool;
    type RadiswapAdapter;

    // Badges
    type Badge;
}

pub struct ScryptoUnitEnvironmentSpecifier;

impl EnvironmentSpecifier for ScryptoUnitEnvironmentSpecifier {
    // Environment
    type Environment = DefaultLedgerSimulator;

    // Components
    type Fidenaro = ComponentAddress;
    type SimpleOracle = ComponentAddress;
    type RadiswapPool = ComponentAddress;
    type RadiswapAdapter = ComponentAddress;

    // Badges
    type Badge = (PublicKey, PrivateKey, ComponentAddress, ResourceAddress);
}

pub struct Environment<S>
where
    S: EnvironmentSpecifier,
{
    /* Test Environment */
    pub environment: S::Environment,
    /* Various entities */
    pub resources: ResourceInformation<ResourceAddress>,
    // pub protocol: ProtocolEntities<S>,
    /* Supported Dexes */
    // pub ociswap_v1: DexEntities<S::OciswapV1Pool, S::OciswapV1Adapter>,
}

impl<S> Environment<S>
where
    S: EnvironmentSpecifier,
{
    const PACKAGE_NAMES: [&'static str; 4] = [
        "../packages/fidenaro",
        "../packages/simple-oracle",
        "../bootstrapping-helper/radiswap",
        "../packages/radiswap-adapter",
    ];

    const RESOURCE_DIVISIBILITIES: ResourceInformation<u8> = ResourceInformation::<u8> {
        bitcoin: 8,
        ethereum: 18,
        usdc: 6,
        usdt: 6,
    };
}

impl ScryptoUnitEnv {
    pub fn new() -> Self {
        Self::new_with_configuration(Configuration::default())
    }

    pub fn new_with_configuration(configuration: Configuration) -> Self {
        // Create a new simple test runner
        let mut ledger_simulator = LedgerSimulatorBuilder::new().without_kernel_trace().build();

        // The account that everything gets deposited into throughout the tests.
        let (public_key, private_key, account) = ledger_simulator.new_account(false);

        let protocol_manager_badge = ledger_simulator.create_fungible_resource(dec!(1), 0, account);
        let protocol_owner_badge = ledger_simulator.create_fungible_resource(dec!(1), 0, account);

        let protocol_manager_rule = rule!(require(protocol_manager_badge));
        let protocol_owner_rule = rule!(require(protocol_owner_badge));

        let [fidenaro_package, simple_oracle_package, radiswap_package, radiswap_adapter_package] =
            Self::PACKAGE_NAMES
                .map(|package_name| ledger_simulator.compile_and_publish(package_name));

        let resource_addresses = Self::RESOURCE_DIVISIBILITIES.map(|divisibility| {
            ledger_simulator.create_freely_mintable_fungible_resource(
                OwnerRole::None,
                None,
                *divisibility,
                account,
            )
        });

        let radiswap_pools = resource_addresses.map(|resource_address| {
            let manifest = ManifestBuilder::new()
                .lock_fee_from_faucet()
                .radiswap_pool_new(radiswap_package, OwnerRole::None, *resource_address, XRD)
                .build();

            let component_address = *ledger_simulator
                .execute_manifest(manifest, vec![])
                .expect_commit_success()
                .new_component_addresses()
                .first()
                .unwrap();

            let manifest = ManifestBuilder::new()
                .lock_fee_from_faucet()
                .mint_fungible(XRD, dec!(100_000_000))
                .mint_fungible(*resource_address, dec!(100_000_000))
                .take_all_from_worktop(XRD, "xrd_bucket")
                .take_all_from_worktop(*resource_address, "other_bucket")
                .with_name_lookup(|builder, _| {
                    let xrd_bucket = builder.bucket("xrd_bucket");
                    let other_bucket = builder.bucket("other_bucket");
                    builder.radiswap_pool_add_liquidity(component_address, xrd_bucket, other_bucket)
                })
                .try_deposit_entire_worktop_or_abort(account, None)
                .build();
            ledger_simulator
                .execute_manifest_without_auth(manifest, public_key)
                .expect_commit_success();

            component_address
        });

        let simple_oracle = ledger_simulator
            .execute_manifest(
                ManifestBuilder::new()
                    .lock_fee_from_faucet()
                    .call_function(
                        simple_oracle_package,
                        "SimpleOracle",
                        "instantiate",
                        (
                            protocol_manager_rule.clone(),
                            MetadataInit::default(),
                            OwnerRole::None,
                            None::<ManifestAddressReservation>,
                        ),
                    )
                    .build(),
                vec![],
            )
            .expect_commit_success()
            .new_component_addresses()
            .first()
            .copied()
            .unwrap();

        // Submitting some dummy prices to the oracle to get things going.
        resource_addresses.map(|resource_address| {
            ledger_simulator
                .execute_manifest_without_auth(
                    ManifestBuilder::new()
                        .create_proof_from_account_of_amount(account, protocol_manager_badge, 1)
                        .lock_fee_from_faucet()
                        .call_method(
                            simple_oracle,
                            "set_price",
                            (*resource_address, XRD, dec!(1)),
                        )
                        .build(),
                    public_key,
                )
                .expect_commit_success();
        });

        // Initializing fidenaro with information
        let fidenaro = ledger_simulator
            .execute_manifest(
                ManifestBuilder::new()
                    .lock_fee_from_faucet()
                    .call_function(
                        fidenaro_package,
                        "Fidenaro",
                        "instantiate",
                        (OwnerRole::None, simple_oracle),
                    )
                    .try_deposit_entire_worktop_or_abort(account, None)
                    .build(),
                vec![],
            )
            .expect_commit_success()
            .new_component_addresses()
            .first()
            .copied()
            .unwrap();

        let radiswap_adapter = [(radiswap_adapter_package, "RadiswapAdapter")].map(
            |(package_address, blueprint_name)| {
                ledger_simulator
                    .execute_manifest(
                        ManifestBuilder::new()
                            .lock_fee_from_faucet()
                            .call_function(
                                package_address,
                                blueprint_name,
                                "instantiate",
                                (
                                    rule!(allow_all),
                                    rule!(allow_all),
                                    MetadataInit::default(),
                                    OwnerRole::None,
                                    None::<ManifestAddressReservation>,
                                ),
                            )
                            .build(),
                        vec![],
                    )
                    .expect_commit_success()
                    .new_component_addresses()
                    .first()
                    .copied()
                    .unwrap()
            },
        );

        Self {
            environment: ledger_simulator,
            resources: resource_addresses,
            // protocol: ProtocolEntities {
            //     fidenaro_package_address: fidenaro_package,
            //     fidenaro,
            //     oracle_package_address: simple_oracle_package,
            //     oracle: simple_oracle,
            //     protocol_owner_badge: (
            //         public_key.into(),
            //         Secp256k1PrivateKey::from_bytes(&private_key.to_bytes())
            //             .unwrap()
            //             .into(),
            //         account,
            //         protocol_owner_badge,
            //     ),
            //     protocol_manager_badge: (
            //         public_key.into(),
            //         private_key.into(),
            //         account,
            //         protocol_manager_badge,
            //     ),
            // },
        }
    }
}

impl Default for ScryptoUnitEnv {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug)]
pub struct ProtocolEntities<S>
where
    S: EnvironmentSpecifier,
{
    /* Fidenaro */
    pub fidenaro_package_address: PackageAddress,
    pub fidenaro: S::Fidenaro,
    /* Oracle */
    pub oracle_package_address: PackageAddress,
    pub oracle: S::SimpleOracle,
    /* Badges */
    pub protocol_owner_badge: S::Badge,
    pub protocol_manager_badge: S::Badge,
}

/// A struct that defines the entities that belong to a Decentralized Exchange.
/// it contains the package address as well as generic items [`T`] which are
/// the stubs used to call the pools.
#[derive(Copy, Clone, Debug)]
pub struct DexEntities<P, A> {
    /* Packages */
    pub package: PackageAddress,
    /* Pools */
    pub pools: ResourceInformation<P>,
    /* Adapter */
    pub adapter_package: PackageAddress,
    pub adapter: A,
    /* Receipt */
    pub liquidity_receipt: ResourceAddress,
}

#[derive(Clone, Debug, Copy)]
pub struct ResourceInformation<T> {
    pub bitcoin: T,
    pub ethereum: T,
    pub usdc: T,
    pub usdt: T,
}

impl<T> ResourceInformation<T> {
    pub fn map<F, O>(&self, mut map: F) -> ResourceInformation<O>
    where
        F: FnMut(&T) -> O,
    {
        ResourceInformation::<O> {
            bitcoin: map(&self.bitcoin),
            ethereum: map(&self.ethereum),
            usdc: map(&self.usdc),
            usdt: map(&self.usdt),
        }
    }

    pub fn try_map<F, O, E>(&self, mut map: F) -> Result<ResourceInformation<O>, E>
    where
        F: FnMut(&T) -> Result<O, E>,
    {
        Ok(ResourceInformation::<O> {
            bitcoin: map(&self.bitcoin)?,
            ethereum: map(&self.ethereum)?,
            usdc: map(&self.usdc)?,
            usdt: map(&self.usdt)?,
        })
    }

    pub fn iter(self) -> impl Iterator<Item = T> {
        [self.bitcoin, self.ethereum, self.usdc, self.usdt].into_iter()
    }

    pub fn zip<O>(self, other: ResourceInformation<O>) -> ResourceInformation<(T, O)> {
        ResourceInformation {
            bitcoin: (self.bitcoin, other.bitcoin),
            ethereum: (self.ethereum, other.ethereum),
            usdc: (self.usdc, other.usdc),
            usdt: (self.usdt, other.usdt),
        }
    }
}

#[derive(Clone, Debug)]
pub struct Configuration {
    pub fees: Decimal,
    pub maximum_allowed_price_staleness_in_seconds_seconds: i64,
    pub maximum_allowed_relative_price_difference: Decimal,
}

impl Default for Configuration {
    fn default() -> Self {
        Self {
            // 1%
            fees: dec!(0.01),
            // 5 Minutes
            maximum_allowed_price_staleness_in_seconds_seconds: 300i64,
            // 1%
            maximum_allowed_relative_price_difference: dec!(0.01),
        }
    }
}
