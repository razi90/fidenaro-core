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
    type Radiswap = RadiswapInterfaceScryptoTestStub;
    type RadiswapAdapter = RadiswapAdapter;

    // Badges
    type Badge = Bucket;

    // Users
    type User = NonFungibleBucket;
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
        let (trade_vault, trade_vault_admin_badge) = TradeVault::instantiate(
            "#0#".to_string(),
            // trader_user_token.non_fungible_local_id().to_string(),
            "Test Vault".to_owned(),
            fidenaro.try_into().unwrap(),
            "Vault short description".to_owned(),
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
            radiswap: DexEntities {
                package: radiswap_package,
                pools: radiswap_pools,
                adapter_package: radiswap_adapter_package,
                adapter: radiswap_adapter.try_into().unwrap(),
            },
        })
    }
}
