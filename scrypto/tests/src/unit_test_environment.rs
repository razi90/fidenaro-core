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

use scrypto::prelude::ScryptoNonFungibleBucket;

use crate::prelude::*;

pub type ScryptoUnitTestEnv = Environment<ScryptoUnitTestEnvironmentSpecifier>;

pub trait EnvironmentSpecifier {
    // Environment
    type Environment;

    // Components
    type Fidenaro;
    type UserFactory;
    type TradeVault;
    type SimpleOracle;
    type Radiswap;
    type RadiswapAdapter;

    // Badges
    type Badge;

    // Users
    // type User;
}

pub struct ScryptoUnitTestEnvironmentSpecifier;

impl EnvironmentSpecifier for ScryptoUnitTestEnvironmentSpecifier {
    // Environment
    type Environment = TestEnvironment<InMemorySubstateDatabase>;

    // Components
    type Fidenaro = Fidenaro;
    type UserFactory = UserFactory;
    type TradeVault = TradeVault;
    type SimpleOracle = SimpleOracle;
    type Radiswap = RadiswapInterfaceScryptoTestStub;
    type RadiswapAdapter = RadiswapAdapter;

    // Badges
    type Badge = Bucket;

    // Users
    // type User = (ComponentAddress, NonFungibleGlobalId);
}

pub struct Environment<S>
where
    S: EnvironmentSpecifier,
{
    /* Test Environment */
    pub environment: S::Environment,
    /* Various entities */
    pub resources: ResourceInformation<ResourceAddress>,
    pub protocol: ProtocolEntities<S>,
    /* Supported Dexes */
    pub radiswap: DexEntities<S::Radiswap, S::RadiswapAdapter>,
}

impl<S> Environment<S>
where
    S: EnvironmentSpecifier,
{
    const PACKAGE_NAMES: [&'static str; 5] = [
        "../packages/fidenaro",
        "../packages/user-factory",
        "../packages/simple-oracle",
        "../bootstrapping-helper/radiswap",
        "../packages/radiswap-adapter",
    ];

    const RESOURCE_DIVISIBILITIES: ResourceInformation<u8> =
        ResourceInformation::<u8> {
            bitcoin: 8,
            ethereum: 18,
            usdc: 6,
            usdt: 6,
        };
}

impl ScryptoUnitTestEnv {
    pub fn new() -> Result<Self, RuntimeError> {
        Self::new_with_configuration(Configuration::default())
    }

    pub fn new_with_configuration(
        _configuration: Configuration,
    ) -> Result<Self, RuntimeError> {
        // Init test environment
        let mut env = TestEnvironmentBuilder::new().build();

        // This environment instantiation function assumes that we do not want
        // to have the auth module enabled and that we are more interested in
        // just testing the behavior. So, the auth module is disabled in the
        // environment. If somebody want it, they can enable it after they
        // instantiate the environment.
        env.disable_auth_module();
        env.disable_limits_module();

        // Creating the badges and their access rules
        let protocol_manager_badge =
            ResourceBuilder::new_fungible(OwnerRole::None)
                .divisibility(0)
                .mint_initial_supply(1, &mut env)?;
        let protocol_owner_badge =
            ResourceBuilder::new_fungible(OwnerRole::None)
                .divisibility(0)
                .mint_initial_supply(1, &mut env)?;

        let protocol_manager_rule = protocol_manager_badge
            .resource_address(&mut env)
            .map(|address| rule!(require(address)))?;
        let protocol_owner_rule = protocol_owner_badge
            .resource_address(&mut env)
            .map(|address| rule!(require(address)))?;

        // Publishing the various packages to the testing environment
        let [fidenaro_package, user_factory_package, simple_oracle_package, radiswap_package, radiswap_adapter_package] =
            Self::PACKAGE_NAMES.map(|name| {
                PackageFactory::compile_and_publish(
                    name,
                    &mut env,
                    CompileProfile::FastWithTraceLogs,
                )
                .unwrap()
            });

        // Convert the fidenaro package address to the Bech32 representation "package_sim1..." to use it to replace it in the blueprint of the trade vault
        std::env::set_var(
            "FIDENARO_PACKAGE_ADDRESS",
            fidenaro_package
                .display(&AddressBech32Encoder::for_simulator())
                .to_string(),
        );

        // Compile and publish the trade vault blueprint
        let trade_vault_package = PackageFactory::compile_and_publish(
            "../packages/trade-vault",
            &mut env,
            CompileProfile::FastWithTraceLogs,
        )
        .unwrap();

        // Creating the various resources and their associated pools.
        let resource_addresses =
            Self::RESOURCE_DIVISIBILITIES.try_map(|divisibility| {
                ResourceBuilder::new_fungible(OwnerRole::Fixed(rule!(
                    allow_all
                )))
                .divisibility(*divisibility)
                .mint_roles(mint_roles! {
                    minter => rule!(allow_all);
                    minter_updater => rule!(allow_all);
                })
                .burn_roles(burn_roles! {
                    burner => rule!(allow_all);
                    burner_updater => rule!(allow_all);
                })
                .mint_initial_supply(dec!(0), &mut env)
                .and_then(|bucket| bucket.resource_address(&mut env))
            })?;

        // Initialize Radiswap pools
        let radiswap_pools =
            resource_addresses.try_map(|resource_address| {
                let mut radiswap_pool = RadiswapInterfaceScryptoTestStub::new(
                    OwnerRole::None,
                    *resource_address,
                    XRD,
                    radiswap_package,
                    &mut env,
                )?;

                let resource_x = ResourceManager(*resource_address)
                    .mint_fungible(dec!(100_000_000), &mut env)?;
                let resource_y = ResourceManager(XRD)
                    .mint_fungible(dec!(100_000_000), &mut env)?;
                let _ = radiswap_pool
                    .add_liquidity(resource_x, resource_y, &mut env)?;

                Ok::<_, RuntimeError>(radiswap_pool)
            })?;

        // Instantiate a simple oracle
        let mut simple_oracle = SimpleOracle::instantiate(
            protocol_manager_rule.clone(),
            Default::default(),
            OwnerRole::None,
            None,
            simple_oracle_package,
            &mut env,
        )?;

        // Submitting some dummy prices to the oracle to get things going.
        resource_addresses.try_map(|resource_address| {
            simple_oracle.set_price(*resource_address, XRD, dec!(1), &mut env)
        })?;

        // Instantiate Fidenaro
        let (mut fidenaro, _) = Fidenaro::instantiate(
            OwnerRole::None,
            simple_oracle.try_into().unwrap(),
            fidenaro_package,
            &mut env,
        )?;

        // Instantiate Radiswap adapter
        let radiswap_adapter = RadiswapAdapter::instantiate(
            rule!(allow_all),
            rule!(allow_all),
            Default::default(),
            OwnerRole::None,
            None,
            radiswap_adapter_package,
            &mut env,
        )?;

        // Add radiswap pools to Fidenaro
        fidenaro.insert_pool_information(
            RadiswapInterfaceScryptoTestStub::blueprint_id(radiswap_package),
            PoolBlueprintInformation {
                adapter: radiswap_adapter.try_into().unwrap(),
                allowed_pools: radiswap_pools
                    .iter()
                    .map(|pool| pool.try_into().unwrap())
                    .collect(),
            },
            &mut env,
        )?;

        // Instantiate user factory
        let mut user_factory =
            UserFactory::instantiate(user_factory_package, &mut env)?;

        let trader_user_token = user_factory.create_new_user(
            "trader".to_string(),
            "bio".to_string(),
            "http://trader-pfp.com".to_string(),
            "twitter".to_string(),
            "telegram".to_string(),
            "discord".to_string(),
            &mut env,
        )?;
        let follower_user_token = user_factory.create_new_user(
            "follower".to_string(),
            "bio".to_string(),
            "http://follower-pfp.com".to_string(),
            "twitter".to_string(),
            "telegram".to_string(),
            "discord".to_string(),
            &mut env,
        )?;

        // Instantiate a trade vault
        let (trade_vault, _) = TradeVault::instantiate(
            "#0#".to_string(),
            // trader_user_token.non_fungible_local_id().to_string(),
            "Test Vault".to_owned(),
            fidenaro.try_into().unwrap(),
            "Vault short description".to_owned(),
            trade_vault_package,
            &mut env,
        )?;

        // // Init user accounts
        // let (_, _, trader_account) = ledger_simulator.new_account(false);
        // let (_, _, follower_account) = ledger_simulator.new_account(false);

        // // Deposit XRD in user accounts
        // [trader_account, follower_account].map(|account| {
        //     ledger_simulator
        //         .execute_manifest(
        //             ManifestBuilder::new()
        //                 .lock_fee_from_faucet()
        //                 .get_free_xrd_from_faucet()
        //                 .try_deposit_entire_worktop_or_abort(account, None)
        //                 .build(),
        //             vec![],
        //         )
        //         .expect_commit_success();
        // });

        // // Init user factory
        // let binding = ledger_simulator.execute_manifest(
        //     ManifestBuilder::new()
        //         .lock_fee_from_faucet()
        //         .call_function(
        //             user_factory_package,
        //             "UserFactory",
        //             "instantiate",
        //             (),
        //         )
        //         .build(),
        //     vec![],
        // );
        // let transaction_receipt = binding.expect_commit_success();

        // let user_factory = transaction_receipt
        //     .new_component_addresses()
        //     .first()
        //     .copied()
        //     .unwrap();

        // let user_nft_resource_addresss = transaction_receipt
        //     .new_resource_addresses()
        //     .first()
        //     .copied()
        //     .unwrap();

        // // Create Fidenaro user NFTs
        // let [trader_user_nft, follower_user_nft] = [
        //     (trader_account, "Trader".to_string()),
        //     (follower_account, "Follower".to_string()),
        // ]
        // .map(|(account, user_type)| {
        //     let bio = user_type.clone() + "Bio";
        //     let pfp = format!("http://{}-pfp.com", user_type);
        //     let twitter = user_type.clone() + "Twitter";
        //     let telegram = user_type.clone() + "Telegram";
        //     let discord = user_type.clone() + "Discord";

        //     let user_nft_vault_id = ledger_simulator
        //         .execute_manifest(
        //             ManifestBuilder::new()
        //                 .lock_fee_from_faucet()
        //                 .call_method(
        //                     user_factory,
        //                     "create_new_user",
        //                     (user_type, bio, pfp, twitter, telegram, discord),
        //                 )
        //                 .try_deposit_entire_worktop_or_abort(account, None)
        //                 .build(),
        //             vec![],
        //         )
        //         .expect_commit_success()
        //         .new_vault_addresses()
        //         .first()
        //         .copied()
        //         .unwrap();

        //     let local_id = ledger_simulator
        //         .inspect_non_fungible_vault(user_nft_vault_id.into())
        //         .unwrap()
        //         .1
        //         .next()
        //         .unwrap();

        //     NonFungibleGlobalId::new(user_nft_resource_addresss, local_id)
        // });

        // // Set user nft resource address in Fidenaro
        // ledger_simulator
        //     .execute_manifest_without_auth(
        //         ManifestBuilder::new()
        //             .lock_fee_from_faucet()
        //             .create_proof_from_account_of_amount(
        //                 account,
        //                 admin_badge_address,
        //                 1,
        //             )
        //             .call_method(
        //                 fidenaro,
        //                 "set_user_token_resource_address",
        //                 (user_nft_resource_addresss,),
        //             )
        //             .build(),
        //     )
        //     .expect_commit_success();

        // // Create a trade vault with the trader account as the manager
        // let transaction_receipt = ledger_simulator.execute_manifest(
        //     ManifestBuilder::new()
        //         .lock_fee_from_faucet()
        //         .call_function(
        //             trade_vault_package,
        //             "TradeVault",
        //             "instantiate",
        //             (
        //                 trader_user_nft.local_id().to_string(),
        //                 "Test Vault",
        //                 fidenaro,
        //                 "Vault short description",
        //             ),
        //         )
        //         .try_deposit_entire_worktop_or_abort(trader_account, None)
        //         .build(),
        //     vec![],
        // );
        // let transaction_result = transaction_receipt.expect_commit_success();

        // let trade_vault = transaction_result
        //     .new_component_addresses()
        //     .first()
        //     .copied()
        //     .unwrap();

        // let trade_vault_admin_badge = transaction_result
        //     .new_resource_addresses()
        //     .first()
        //     .copied()
        //     .unwrap();

        // let trade_vault_share_token = transaction_result
        //     .new_resource_addresses()
        //     .last()
        //     .copied()
        //     .unwrap();

        Ok(Self {
            environment: env,
            resources: resource_addresses,
            protocol: ProtocolEntities {
                fidenaro_package_address: fidenaro_package,
                fidenaro,
                user_factory_package_address: user_factory_package,
                user_factory,
                trade_vault_package_address: trade_vault_package,
                trade_vault,
                // trade_vault_admin_badge,
                // trade_vault_share_token,
                oracle_package_address: simple_oracle_package,
                oracle: simple_oracle,
                protocol_owner_badge,
                protocol_manager_badge,
                // trader,
                // follower,
            },
            radiswap: DexEntities {
                package: radiswap_package,
                pools: radiswap_pools,
                adapter_package: radiswap_adapter_package,
                adapter: radiswap_adapter.try_into().unwrap(),
            },
        })
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
    /* User Factory */
    pub user_factory_package_address: PackageAddress,
    pub user_factory: S::UserFactory,
    /* Trade Vault */
    pub trade_vault_package_address: PackageAddress,
    pub trade_vault: S::TradeVault,
    // pub trade_vault_admin_badge: ResourceAddress,
    // pub trade_vault_share_token: ResourceAddress,
    /* Oracle */
    pub oracle_package_address: PackageAddress,
    pub oracle: S::SimpleOracle,
    /* Badges */
    pub protocol_owner_badge: S::Badge,
    pub protocol_manager_badge: S::Badge,
    // pub trader: S::User,
    // pub follower: S::User,
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

    pub fn try_map<F, O, E>(
        &self,
        mut map: F,
    ) -> Result<ResourceInformation<O>, E>
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

    pub fn zip<O>(
        self,
        other: ResourceInformation<O>,
    ) -> ResourceInformation<(T, O)> {
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
