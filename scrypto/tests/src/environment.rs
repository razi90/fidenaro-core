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
    type Environment = DefaultTestRunner;

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
    const PACKAGE_NAMES: [&'static str; 4] =
        ["fidenaro", "simple-oracle", "radiswap", "radiswap-adapter"];

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
        let mut test_runner = TestRunnerBuilder::new().without_trace().build();

        // The account that everything gets deposited into throughout the tests.
        let (public_key, private_key, account) = test_runner.new_account(false);

        let protocol_manager_badge = test_runner.create_fungible_resource(dec!(1), 0, account);
        let protocol_owner_badge = test_runner.create_fungible_resource(dec!(1), 0, account);

        let protocol_manager_rule = rule!(require(protocol_manager_badge));
        let protocol_owner_rule = rule!(require(protocol_owner_badge));

        let [fidenaro_package, simple_oracle_package, radiswap_package, radiswap_adapter] =
            Self::PACKAGE_NAMES.map(|package_name| {
                let (code, definition) = package_loader::PackageLoader::get(package_name);
                test_runner.publish_package((code, definition), Default::default(), OwnerRole::None)
            });

        let resource_addresses = Self::RESOURCE_DIVISIBILITIES.map(|divisibility| {
            test_runner.create_freely_mintable_fungible_resource(
                OwnerRole::None,
                None,
                *divisibility,
                account,
            )
        });

        // let [ociswap_v1_liquidity_receipt_resource, ociswap_v2_liquidity_receipt_resource, defiplaza_v2_liquidity_receipt_resource, caviarnine_v1_liquidity_receipt_resource] =
        //     std::array::from_fn(|_| {
        //         test_runner
        //         .execute_manifest(
        //             ManifestBuilder::new()
        //                 .lock_fee_from_faucet()
        //                 .call_function(
        //                     RESOURCE_PACKAGE,
        //                     NON_FUNGIBLE_RESOURCE_MANAGER_BLUEPRINT,
        //                     NON_FUNGIBLE_RESOURCE_MANAGER_CREATE_RUID_WITH_INITIAL_SUPPLY_IDENT,
        //                     NonFungibleResourceManagerCreateRuidWithInitialSupplyManifestInput {
        //                         owner_role: OwnerRole::None,
        //                         track_total_supply: true,
        //                         non_fungible_schema: NonFungibleDataSchema::new_local_without_self_package_replacement::<LiquidityReceipt<AnyValue>>(),
        //                         entries: vec![],
        //                         resource_roles: NonFungibleResourceRoles {
        //                             mint_roles: mint_roles! {
        //                                 minter => rule!(allow_all);
        //                                 minter_updater => rule!(allow_all);
        //                             },
        //                             burn_roles: burn_roles! {
        //                                 burner => rule!(allow_all);
        //                                 burner_updater => rule!(allow_all);
        //                             },
        //                             ..Default::default()
        //                         },
        //                         metadata: Default::default(),
        //                         address_reservation: Default::default(),
        //                     },
        //                 )
        //                 .build(),
        //             vec![],
        //         )
        //         .expect_commit_success()
        //         .new_resource_addresses()
        //         .first()
        //         .copied()
        //         .unwrap()
        //     });

        // let ociswap_v1_pools = resource_addresses.map(|resource_address| {
        //     let manifest = ManifestBuilder::new()
        //         .lock_fee_from_faucet()
        //         .ociswap_v1_pool_instantiate(
        //             ociswap_v1_package,
        //             *resource_address,
        //             XRD,
        //             configuration.fees,
        //             FAUCET,
        //         )
        //         .build();
        //     let component_address = *test_runner
        //         .execute_manifest(manifest, vec![])
        //         .expect_commit_success()
        //         .new_component_addresses()
        //         .first()
        //         .unwrap();

        //     let manifest = ManifestBuilder::new()
        //         .lock_fee_from_faucet()
        //         .mint_fungible(XRD, dec!(100_000_000))
        //         .mint_fungible(*resource_address, dec!(100_000_000))
        //         .take_all_from_worktop(XRD, "xrd_bucket")
        //         .take_all_from_worktop(*resource_address, "other_bucket")
        //         .with_name_lookup(|builder, _| {
        //             let xrd_bucket = builder.bucket("xrd_bucket");
        //             let other_bucket = builder.bucket("other_bucket");
        //             builder.ociswap_v1_pool_add_liquidity(
        //                 component_address,
        //                 xrd_bucket,
        //                 other_bucket,
        //             )
        //         })
        //         .try_deposit_entire_worktop_or_abort(account, None)
        //         .build();
        //     test_runner
        //         .execute_manifest_without_auth(manifest)
        //         .expect_commit_success();

        //     component_address
        // });

        // let caviarnine_v1_pools = resource_addresses.map(|resource_address| {
        //     let manifest = ManifestBuilder::new()
        //         .lock_fee_from_faucet()
        //         .allocate_global_address(
        //             caviarnine_v1_package,
        //             "QuantaSwap",
        //             "reservation",
        //             "address",
        //         )
        //         .mint_fungible(XRD, dec!(100_000_000))
        //         .mint_fungible(*resource_address, dec!(100_000_000))
        //         .take_all_from_worktop(XRD, "xrd_bucket")
        //         .take_all_from_worktop(*resource_address, "other_bucket")
        //         .with_name_lookup(|builder, _| {
        //             let reservation = builder.address_reservation("reservation");
        //             let address = builder.named_address("address");

        //             let xrd_bucket = builder.bucket("xrd_bucket");
        //             let other_bucket = builder.bucket("other_bucket");

        //             builder
        //                 .caviarnine_v1_pool_new(
        //                     caviarnine_v1_package,
        //                     rule!(allow_all),
        //                     rule!(allow_all),
        //                     *resource_address,
        //                     XRD,
        //                     50,
        //                     Some(reservation),
        //                 )
        //                 .caviarnine_v1_pool_add_liquidity(
        //                     address,
        //                     other_bucket,
        //                     xrd_bucket,
        //                     vec![(27000, dec!(100_000_000), dec!(100_000_000))],
        //                 )
        //         })
        //         .try_deposit_entire_worktop_or_abort(account, None)
        //         .build();
        //     *test_runner
        //         .execute_manifest_without_auth(manifest)
        //         .expect_commit_success()
        //         .new_component_addresses()
        //         .first()
        //         .unwrap()
        // });

        // let (ociswap_v2_package, ociswap_v2_adapter_v1_package, ociswap_v2_pools) = {
        //     let ociswap_v2_pool_package = {
        //         let ociswap_v2_package_wasm = include_bytes!("../assets/ociswap_v2_pool.wasm");
        //         let ociswap_v2_package_rpd = include_bytes!("../assets/ociswap_v2_pool.rpd");
        //         let ociswap_v2_package_definition =
        //             manifest_decode::<PackageDefinition>(ociswap_v2_package_rpd).unwrap();

        //         test_runner.publish_package(
        //             (
        //                 ociswap_v2_package_wasm.to_vec(),
        //                 ociswap_v2_package_definition,
        //             ),
        //             Default::default(),
        //             Default::default(),
        //         )
        //     };
        //     let ociswap_v2_registry_package = {
        //         let ociswap_v2_package_wasm = include_bytes!("../assets/ociswap_v2_registry.wasm");
        //         let ociswap_v2_package_rpd = include_bytes!("../assets/ociswap_v2_registry.rpd");
        //         let ociswap_v2_package_definition =
        //             manifest_decode::<PackageDefinition>(ociswap_v2_package_rpd).unwrap();

        //         test_runner.publish_package(
        //             (
        //                 ociswap_v2_package_wasm.to_vec(),
        //                 ociswap_v2_package_definition,
        //             ),
        //             Default::default(),
        //             Default::default(),
        //         )
        //     };

        //     let registry = test_runner
        //         .execute_manifest(
        //             ManifestBuilder::new()
        //                 .lock_fee_from_faucet()
        //                 .ociswap_v2_registry_instantiate(
        //                     ociswap_v2_registry_package,
        //                     GLOBAL_CALLER_VIRTUAL_BADGE,
        //                     dec!(0.03),
        //                     10080,
        //                     20,
        //                 )
        //                 .build(),
        //             vec![],
        //         )
        //         .expect_commit_success()
        //         .new_component_addresses()
        //         .first()
        //         .copied()
        //         .unwrap();

        //     let (code, definition) = package_loader::PackageLoader::get("ociswap-v2-adapter-v1");
        //     let ociswap_v2_adapter_v1_package = test_runner.publish_package(
        //         (code, definition),
        //         Default::default(),
        //         OwnerRole::None,
        //     );

        //     let ociswap_v2_pools = resource_addresses.map(|resource_address| {
        //         let (resource_x, resource_y) = if XRD < *resource_address {
        //             (XRD, *resource_address)
        //         } else {
        //             (*resource_address, XRD)
        //         };

        //         let manifest = ManifestBuilder::new()
        //             .lock_fee_from_faucet()
        //             .ociswap_v2_pool_instantiate(
        //                 ociswap_v2_pool_package,
        //                 resource_x,
        //                 resource_y,
        //                 pdec!(1),
        //                 60,
        //                 dec!(0.03),
        //                 dec!(0.03),
        //                 registry,
        //                 vec![],
        //                 FAUCET,
        //             )
        //             .build();
        //         let component_address = *test_runner
        //             .execute_manifest(manifest, vec![])
        //             .expect_commit_success()
        //             .new_component_addresses()
        //             .first()
        //             .unwrap();

        //         let manifest = ManifestBuilder::new()
        //             .lock_fee_from_faucet()
        //             .mint_fungible(XRD, dec!(100_000_000))
        //             .mint_fungible(*resource_address, dec!(100_000_000))
        //             .take_all_from_worktop(resource_x, "resource_x_bucket")
        //             .take_all_from_worktop(resource_y, "resource_y_bucket")
        //             .with_name_lookup(|builder, _| {
        //                 let resource_x_bucket = builder.bucket("resource_x_bucket");
        //                 let resource_y_bucket = builder.bucket("resource_y_bucket");
        //                 builder.ociswap_v2_pool_add_liquidity(
        //                     component_address,
        //                     -10_000,
        //                     10_000,
        //                     resource_x_bucket,
        //                     resource_y_bucket,
        //                 )
        //             })
        //             .try_deposit_entire_worktop_or_abort(account, None)
        //             .build();
        //         test_runner
        //             .execute_manifest_without_auth(manifest)
        //             .expect_commit_success();

        //         component_address
        //     });

        //     (
        //         ociswap_v2_pool_package,
        //         ociswap_v2_adapter_v1_package,
        //         ociswap_v2_pools,
        //     )
        // };

        // let (defiplaza_v2_package, defiplaza_v2_adapter_v1_package, defiplaza_v2_pools) = {
        //     let defiplaza_v2_pool_package = {
        //         let defiplaza_v2_package_wasm = include_bytes!("../assets/defiplaza_v2.wasm");
        //         let defiplaza_v2_package_rpd = include_bytes!("../assets/defiplaza_v2.rpd");
        //         let defiplaza_v2_package_definition =
        //             manifest_decode::<PackageDefinition>(defiplaza_v2_package_rpd).unwrap();

        //         test_runner.publish_package(
        //             (
        //                 defiplaza_v2_package_wasm.to_vec(),
        //                 defiplaza_v2_package_definition,
        //             ),
        //             Default::default(),
        //             Default::default(),
        //         )
        //     };

        //     let (code, definition) = package_loader::PackageLoader::get("defiplaza-v2-adapter-v1");
        //     let defiplaza_v2_adapter_v1_package = test_runner.publish_package(
        //         (code, definition),
        //         Default::default(),
        //         OwnerRole::None,
        //     );

        //     let defiplaza_v2_pools = resource_addresses.map(|resource_address| {
        //         let (resource_x, resource_y) = if XRD < *resource_address {
        //             (XRD, *resource_address)
        //         } else {
        //             (*resource_address, XRD)
        //         };

        //         let manifest = ManifestBuilder::new()
        //             .lock_fee_from_faucet()
        //             .defi_plaza_v2_pool_instantiate_pair(
        //                 defiplaza_v2_pool_package,
        //                 OwnerRole::None,
        //                 resource_x,
        //                 resource_y,
        //                 PairConfig {
        //                     k_in: dec!("0.4"),
        //                     k_out: dec!("1"),
        //                     fee: dec!("0"),
        //                     decay_factor: dec!("0.9512"),
        //                 },
        //                 dec!(1),
        //             )
        //             .build();
        //         let component_address = *test_runner
        //             .execute_manifest(manifest, vec![])
        //             .expect_commit_success()
        //             .new_component_addresses()
        //             .first()
        //             .unwrap();

        //         let manifest = ManifestBuilder::new()
        //             .lock_fee_from_faucet()
        //             .mint_fungible(XRD, dec!(100_000_000))
        //             .mint_fungible(*resource_address, dec!(100_000_000))
        //             .take_all_from_worktop(resource_x, "resource_x_bucket")
        //             .take_all_from_worktop(resource_y, "resource_y_bucket")
        //             .with_name_lookup(|builder, _| {
        //                 let resource_x_bucket = builder.bucket("resource_x_bucket");
        //                 let resource_y_bucket = builder.bucket("resource_y_bucket");
        //                 builder
        //                     .defi_plaza_v2_pool_add_liquidity(
        //                         component_address,
        //                         resource_x_bucket,
        //                         None,
        //                     )
        //                     .defi_plaza_v2_pool_add_liquidity(
        //                         component_address,
        //                         resource_y_bucket,
        //                         None,
        //                     )
        //             })
        //             .try_deposit_entire_worktop_or_abort(account, None)
        //             .build();
        //         test_runner
        //             .execute_manifest_without_auth(manifest)
        //             .expect_commit_success();

        //         component_address
        //     });

        //     (
        //         defiplaza_v2_pool_package,
        //         defiplaza_v2_adapter_v1_package,
        //         defiplaza_v2_pools,
        //     )
        // };

        // let simple_oracle = test_runner
        //     .execute_manifest(
        //         ManifestBuilder::new()
        //             .lock_fee_from_faucet()
        //             .call_function(
        //                 simple_oracle_package,
        //                 "SimpleOracle",
        //                 "instantiate",
        //                 (
        //                     protocol_manager_rule.clone(),
        //                     MetadataInit::default(),
        //                     OwnerRole::None,
        //                     None::<ManifestAddressReservation>,
        //                 ),
        //             )
        //             .build(),
        //         vec![],
        //     )
        //     .expect_commit_success()
        //     .new_component_addresses()
        //     .first()
        //     .copied()
        //     .unwrap();

        // // Submitting some dummy prices to the oracle to get things going.
        // resource_addresses.map(|resource_address| {
        //     test_runner
        //         .execute_manifest_without_auth(
        //             ManifestBuilder::new()
        //                 .lock_fee_from_faucet()
        //                 .call_method(
        //                     simple_oracle,
        //                     "set_price",
        //                     (*resource_address, XRD, dec!(1)),
        //                 )
        //                 .build(),
        //         )
        //         .expect_commit_success();
        // });

        // // Initializing ignition with information
        // let ignition = test_runner
        //     .execute_manifest(
        //         ManifestBuilder::new()
        //             .lock_fee_from_faucet()
        //             .call_function(
        //                 ignition_package,
        //                 "Ignition",
        //                 "instantiate",
        //                 (
        //                     MetadataInit::default(),
        //                     OwnerRole::None,
        //                     protocol_owner_rule,
        //                     protocol_manager_rule,
        //                     XRD,
        //                     simple_oracle,
        //                     configuration.maximum_allowed_price_staleness_in_seconds_seconds,
        //                     configuration.maximum_allowed_relative_price_difference,
        //                     InitializationParametersManifest::default(),
        //                     None::<ManifestAddressReservation>,
        //                 ),
        //             )
        //             .build(),
        //         vec![],
        //     )
        //     .expect_commit_success()
        //     .new_component_addresses()
        //     .first()
        //     .copied()
        //     .unwrap();

        // let [ociswap_v1_adapter_v1, ociswap_v2_adapter_v1, defiplaza_v2_adapter_v1, caviarnine_v1_adapter_v1] =
        //     [
        //         (ociswap_v1_adapter_v1_package, "OciswapV1Adapter"),
        //         (ociswap_v2_adapter_v1_package, "OciswapV2Adapter"),
        //         (defiplaza_v2_adapter_v1_package, "DefiPlazaV2Adapter"),
        //         (caviarnine_v1_adapter_v1_package, "CaviarnineV1Adapter"),
        //     ]
        //     .map(|(package_address, blueprint_name)| {
        //         test_runner
        //             .execute_manifest(
        //                 ManifestBuilder::new()
        //                     .lock_fee_from_faucet()
        //                     .call_function(
        //                         package_address,
        //                         blueprint_name,
        //                         "instantiate",
        //                         (
        //                             rule!(allow_all),
        //                             rule!(allow_all),
        //                             MetadataInit::default(),
        //                             OwnerRole::None,
        //                             None::<ManifestAddressReservation>,
        //                         ),
        //                     )
        //                     .build(),
        //                 vec![],
        //             )
        //             .expect_commit_success()
        //             .new_component_addresses()
        //             .first()
        //             .copied()
        //             .unwrap()
        //     });

        // test_runner
        //     .execute_manifest(
        //         ManifestBuilder::new()
        //             .lock_fee_from_faucet()
        //             .call_method(
        //                 defiplaza_v2_adapter_v1,
        //                 "add_pair_configs",
        //                 (defiplaza_v2_pools
        //                     .iter()
        //                     .map(|address| {
        //                         (
        //                             address,
        //                             PairConfig {
        //                                 k_in: dec!("0.4"),
        //                                 k_out: dec!("1"),
        //                                 fee: dec!("0"),
        //                                 decay_factor: dec!("0.9512"),
        //                             },
        //                         )
        //                     })
        //                     .collect::<IndexMap<_, _>>(),),
        //             )
        //             .build(),
        //         vec![],
        //     )
        //     .expect_commit_success();

        // // Cache the addresses of the various Caviarnine pools.
        // test_runner
        //     .execute_manifest_ignoring_fee(
        //         TransactionManifestV1 {
        //             instructions: caviarnine_v1_pools
        //                 .iter()
        //                 .map(|address| InstructionV1::CallMethod {
        //                     address: caviarnine_v1_adapter_v1.into(),
        //                     method_name: "preload_pool_information".to_owned(),
        //                     args: manifest_args!(address).into(),
        //                 })
        //                 .collect(),
        //             blobs: Default::default(),
        //         },
        //         vec![],
        //     )
        //     .expect_commit_success();

        // {
        //     let manifest = ManifestBuilder::new()
        //         .lock_fee_from_faucet()
        //         .call_method(ignition, "set_is_open_position_enabled", (true,))
        //         .call_method(ignition, "set_is_close_position_enabled", (true,))
        //         .call_method(
        //             ignition,
        //             "add_reward_rate",
        //             (LockupPeriod::from_months(6).unwrap(), dec!(0.2)),
        //         )
        //         .call_method(
        //             ignition,
        //             "add_reward_rate",
        //             (LockupPeriod::from_months(12).unwrap(), dec!(0.4)),
        //         )
        //         .mint_fungible(XRD, dec!(200_000_000_000_000))
        //         .take_from_worktop(XRD, dec!(100_000_000_000_000), "volatile")
        //         .take_from_worktop(XRD, dec!(100_000_000_000_000), "non_volatile")
        //         .with_name_lookup(|builder, _| {
        //             let volatile = builder.bucket("volatile");
        //             let non_volatile = builder.bucket("non_volatile");

        //             builder
        //                 .call_method(
        //                     ignition,
        //                     "deposit_protocol_resources",
        //                     (volatile, Volatility::Volatile),
        //                 )
        //                 .call_method(
        //                     ignition,
        //                     "deposit_protocol_resources",
        //                     (non_volatile, Volatility::NonVolatile),
        //                 )
        //         })
        //         .with_name_lookup(|mut builder, _| {
        //             let ResourceInformation {
        //                 bitcoin,
        //                 ethereum,
        //                 usdc,
        //                 usdt,
        //             } = resource_addresses;

        //             for instruction in [
        //                 (bitcoin, Volatility::Volatile),
        //                 (ethereum, Volatility::Volatile),
        //                 (usdc, Volatility::NonVolatile),
        //                 (usdt, Volatility::NonVolatile),
        //             ]
        //             .map(|(address, volatility)| InstructionV1::CallMethod {
        //                 address: ignition.into(),
        //                 method_name: "insert_user_resource_volatility".to_owned(),
        //                 args: manifest_args!(address, volatility).into(),
        //             }) {
        //                 builder = builder.add_instruction_advanced(instruction).0;
        //             }

        //             for (
        //                 adapter_address,
        //                 pools,
        //                 liquidity_receipt,
        //                 package_address,
        //                 blueprint_name,
        //             ) in [
        //                 (
        //                     ociswap_v1_adapter_v1,
        //                     ociswap_v1_pools,
        //                     ociswap_v1_liquidity_receipt_resource,
        //                     ociswap_v1_package,
        //                     "BasicPool",
        //                 ),
        //                 (
        //                     ociswap_v2_adapter_v1,
        //                     ociswap_v2_pools,
        //                     ociswap_v2_liquidity_receipt_resource,
        //                     ociswap_v2_package,
        //                     "LiquidityPool",
        //                 ),
        //                 (
        //                     defiplaza_v2_adapter_v1,
        //                     defiplaza_v2_pools,
        //                     defiplaza_v2_liquidity_receipt_resource,
        //                     defiplaza_v2_package,
        //                     "PlazaPair",
        //                 ),
        //                 (
        //                     caviarnine_v1_adapter_v1,
        //                     caviarnine_v1_pools,
        //                     caviarnine_v1_liquidity_receipt_resource,
        //                     caviarnine_v1_package,
        //                     "QuantaSwap",
        //                 ),
        //             ] {
        //                 builder = builder.call_method(
        //                     ignition,
        //                     "insert_pool_information",
        //                     (
        //                         BlueprintId {
        //                             package_address,
        //                             blueprint_name: blueprint_name.to_owned(),
        //                         },
        //                         (
        //                             adapter_address,
        //                             pools.iter().collect::<Vec<_>>(),
        //                             liquidity_receipt,
        //                         ),
        //                     ),
        //                 );
        //             }

        //             builder
        //         })
        //         .build();
        //     test_runner
        //         .execute_manifest_with_enabled_modules(
        //             manifest,
        //             EnabledModules::for_test_transaction()
        //                 & !EnabledModules::AUTH
        //                 & !EnabledModules::COSTING,
        //         )
        //         .expect_commit_success();
        // }

        Self {
            environment: test_runner,
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
