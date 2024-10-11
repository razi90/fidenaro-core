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

pub type ScryptoUnitTestEnv = Environment<ScryptoUnitTestEnvironmentSpecifier>;

pub struct ScryptoUnitTestEnvironmentSpecifier;

impl EnvironmentSpecifier for ScryptoUnitTestEnvironmentSpecifier {
    // Environment
    type Environment = TestEnvironment<InMemorySubstateDatabase>;

    // Components
    type Fidenaro = Fidenaro;
    type UserFactory = UserFactory;
    type TradeVault = TradeVault;
    type SimpleOracle = SimpleOracle;
    type Ociswap = PrecisionPoolInterfaceScryptoTestStub;
    type OciswapV2Adapter = OciswapV2Adapter;

    // Badges
    type Badge = Bucket;

    // Users
    type User = NonFungibleBucket;
}

impl ScryptoUnitTestEnv {
    pub fn new() -> Result<Self, RuntimeError> {
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
        let _protocol_owner_rule = protocol_owner_badge
            .resource_address(&mut env)
            .map(|address| rule!(require(address)))?;

        // Publishing the various packages to the testing environment
        let [fidenaro_package, user_factory_package, simple_oracle_package, ociswap_adapter_package, ociswap_v2_pool_package, ociswap_v2_registry_package, trade_engine_package] =
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

        // Convert the trade engine package address to the Bech32 representation "package_sim1..." to use it to replace it in the blueprint of the trade vault
        std::env::set_var(
            "TRADE_ENGINE_PACKAGE_ADDRESS",
            trade_engine_package
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

        // Initialize Ociswap pools
        let registry = RegistryInterfaceScryptoTestStub::instantiate(
            GLOBAL_CALLER_VIRTUAL_BADGE,
            dec!(0.03),
            10080,
            20,
            ociswap_v2_registry_package,
            &mut env,
        )?;

        let ociswap_v2_pools =
            resource_addresses.try_map(|resource_address| {
                let (resource_x, resource_y) = if XRD < *resource_address {
                    (XRD, *resource_address)
                } else {
                    (*resource_address, XRD)
                };

                let (mut ociswap_pool, ..) =
                    PrecisionPoolInterfaceScryptoTestStub::instantiate(
                        resource_x,
                        resource_y,
                        pdec!(1),
                        60,
                        dec!(0.03),
                        dec!(0.03),
                        registry.try_into().unwrap(),
                        vec![],
                        FAUCET,
                        ociswap_v2_pool_package,
                        &mut env,
                    )?;

                let resource_x = ResourceManager(resource_x)
                    .mint_fungible(dec!(100_000_000), &mut env)?;
                let resource_y = ResourceManager(resource_y)
                    .mint_fungible(dec!(100_000_000), &mut env)?;

                let _ = ociswap_pool.add_liquidity(
                    -10_000, 10_000, resource_x, resource_y, &mut env,
                )?;

                Ok::<_, RuntimeError>(ociswap_pool)
            })?;

        // Instantiate trade engine
        let mut trade_engine =
            TradeEngine::instantiate(trade_engine_package, &mut env)?;

        let xrd_bucket =
            ResourceManager(XRD).mint_fungible(dec!(100_000_000), &mut env)?;
        trade_engine.deposit_resource(xrd_bucket, &mut env)?;

        resource_addresses.try_map(|resource_address| {
            let resource = ResourceManager(*resource_address)
                .mint_fungible(dec!(100_000_000), &mut env)?;
            trade_engine.deposit_resource(resource, &mut env)
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

        // Instantiate Ociswap adapter
        let ociswap_adapter = OciswapV2Adapter::instantiate(
            rule!(allow_all),
            rule!(allow_all),
            Default::default(),
            OwnerRole::None,
            None,
            ociswap_adapter_package,
            &mut env,
        )?;

        // Add radiswap pools to Fidenaro
        fidenaro.insert_pool_information(
            PrecisionPoolInterfaceScryptoTestStub::blueprint_id(
                ociswap_v2_pool_package,
            ),
            PoolBlueprintInformation {
                adapter: ociswap_adapter.try_into().unwrap(),
                allowed_pools: ociswap_v2_pools
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

        // Add user factory address
        fidenaro.set_user_token_resource_address(
            follower_user_token.0.resource_address(&mut env)?,
            &mut env,
        )?;

        // Instantiate a trade vault
        let (trade_vault, trade_vault_admin_badge) = TradeVault::instantiate(
            trader_user_token.0.create_proof_of_all(&mut env)?,
            "Test Vault".to_owned(),
            fidenaro.try_into().unwrap(),
            "Vault short description".to_owned(),
            trade_engine.try_into().unwrap(),
            trade_vault_package,
            &mut env,
        )?;

        let share_token_manager = env
            .with_component_state::<TradeVaultState, _, _, _>(
                trade_vault,
                |substate, _| substate.share_token_manager.clone(),
            )?;

        let trade_vault_share_token = share_token_manager.address();

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
                trade_vault_admin_badge: trade_vault_admin_badge.into(),
                trade_vault_share_token,
                oracle_package_address: simple_oracle_package,
                oracle: simple_oracle,
                protocol_owner_badge,
                protocol_manager_badge,
                trader: trader_user_token,
                follower: follower_user_token,
            },
            ociswap: DexEntities {
                package: ociswap_v2_pool_package,
                pools: ociswap_v2_pools,
                adapter_package: ociswap_adapter_package,
                adapter: ociswap_adapter.try_into().unwrap(),
            },
        })
    }
}
