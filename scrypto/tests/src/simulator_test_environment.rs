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

pub type ScryptoSimulatorEnv =
    Environment<ScryptoSimulatorEnvironmentSpecifier>;

pub struct ScryptoSimulatorEnvironmentSpecifier;

impl EnvironmentSpecifier for ScryptoSimulatorEnvironmentSpecifier {
    // Environment
    type Environment = DefaultLedgerSimulator;

    // Components
    type Fidenaro = ComponentAddress;
    type UserFactory = ComponentAddress;
    type TradeVault = ComponentAddress;
    type SimpleOracle = ComponentAddress;
    type Radiswap = ComponentAddress;
    type RadiswapAdapter = ComponentAddress;

    // Badges
    type Badge = (PublicKey, PrivateKey, ComponentAddress, ResourceAddress);

    // Users
    type User = (ComponentAddress, NonFungibleGlobalId);
}

impl ScryptoSimulatorEnv {
    pub fn new() -> Self {
        Self::new_with_configuration(Configuration::default())
    }

    pub fn new_with_configuration(_configuration: Configuration) -> Self {
        // Create a new simple test runner
        let mut ledger_simulator =
            LedgerSimulatorBuilder::new().without_kernel_trace().build();

        // The account that everything gets deposited into throughout the tests.
        let (public_key, private_key, account) =
            ledger_simulator.new_account(false);

        let protocol_manager_badge =
            ledger_simulator.create_fungible_resource(dec!(1), 0, account);
        let protocol_owner_badge =
            ledger_simulator.create_fungible_resource(dec!(1), 0, account);

        let protocol_manager_rule = rule!(require(protocol_manager_badge));
        let _protocol_owner_rule = rule!(require(protocol_owner_badge));

        // Compile and publish packages
        let [fidenaro_package, user_factory_package, simple_oracle_package, radiswap_package, radiswap_adapter_package] =
            Self::PACKAGE_NAMES.map(|package_name| {
                ledger_simulator.compile_and_publish(package_name)
            });

        // Convert the fidenaro package address to the Bech32 representation "package_sim1..." to use it to replace it in the blueprint of the trade vault
        std::env::set_var(
            "FIDENARO_PACKAGE_ADDRESS",
            fidenaro_package
                .display(&AddressBech32Encoder::for_simulator())
                .to_string(),
        );

        // Compile and publish the trade vault blueprint
        let trade_vault_package =
            ledger_simulator.compile_and_publish("../packages/trade-vault");

        // Create resources
        let resource_addresses =
            Self::RESOURCE_DIVISIBILITIES.map(|divisibility| {
                ledger_simulator.create_freely_mintable_fungible_resource(
                    OwnerRole::None,
                    None,
                    *divisibility,
                    account,
                )
            });

        // Initialize Radiswap pools
        let radiswap_pools = resource_addresses.map(|resource_address| {
            let manifest = ManifestBuilder::new()
                .lock_fee_from_faucet()
                .radiswap_new(
                    radiswap_package,
                    OwnerRole::None,
                    *resource_address,
                    XRD,
                )
                .build();

            let component_address = *ledger_simulator
                .execute_manifest(manifest, vec![])
                .expect_commit_success()
                .new_component_addresses()
                .first()
                .unwrap();

            let manifest = ManifestBuilder::new()
                .lock_fee_from_faucet()
                .create_proof_from_account_of_amount(
                    account,
                    protocol_manager_badge,
                    1,
                )
                .mint_fungible(XRD, dec!(100_000_000))
                .mint_fungible(*resource_address, dec!(100_000_000))
                .take_all_from_worktop(XRD, "xrd_bucket")
                .take_all_from_worktop(*resource_address, "other_bucket")
                .with_name_lookup(|builder, _| {
                    let xrd_bucket = builder.bucket("xrd_bucket");
                    let other_bucket = builder.bucket("other_bucket");
                    builder.radiswap_add_liquidity(
                        component_address,
                        xrd_bucket,
                        other_bucket,
                    )
                })
                .try_deposit_entire_worktop_or_abort(account, None)
                .build();
            ledger_simulator
                .execute_manifest_without_auth(manifest)
                .expect_commit_success();

            component_address
        });

        // Initialize a simple oracle
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
                        .lock_fee_from_faucet()
                        .call_method(
                            simple_oracle,
                            "set_price",
                            (*resource_address, XRD, dec!(1)),
                        )
                        .build(),
                )
                .expect_commit_success();
        });

        // Initializing fidenaro with information
        let binding = ledger_simulator.execute_manifest(
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
        );
        let transaction_receipt = binding.expect_commit_success();

        let fidenaro = transaction_receipt
            .new_component_addresses()
            .first()
            .copied()
            .unwrap();

        let admin_badge_address = transaction_receipt
            .new_resource_addresses()
            .first()
            .copied()
            .unwrap();

        // Initialze the Radiswap adapter
        let radiswap_adapter = ledger_simulator
            .execute_manifest(
                ManifestBuilder::new()
                    .lock_fee_from_faucet()
                    .call_function(
                        radiswap_adapter_package,
                        "RadiswapAdapter",
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
            .unwrap();

        // Add radiswap pools to Fidenaro
        ledger_simulator
            .execute_manifest_without_auth(
                ManifestBuilder::new()
                    .lock_fee_from_faucet()
                    .call_method(
                        fidenaro,
                        "insert_pool_information",
                        (
                            RadiswapInterfaceScryptoTestStub::blueprint_id(
                                radiswap_package,
                            ),
                            PoolBlueprintInformation {
                                adapter: radiswap_adapter,
                                allowed_pools: radiswap_pools
                                    .iter()
                                    .map(|pool| pool.try_into().unwrap())
                                    .collect(),
                            },
                        ),
                    )
                    .build(),
            )
            .expect_commit_success();

        // Init user accounts
        let (trader_public_key, trader_private_key, trader_account) =
            ledger_simulator.new_account(false);
        let (_, _, follower_account) = ledger_simulator.new_account(false);

        // Deposit XRD in user accounts
        [trader_account, follower_account].map(|account| {
            ledger_simulator
                .execute_manifest(
                    ManifestBuilder::new()
                        .lock_fee_from_faucet()
                        .get_free_xrd_from_faucet()
                        .try_deposit_entire_worktop_or_abort(account, None)
                        .build(),
                    vec![],
                )
                .expect_commit_success();
        });

        // Init user factory
        let binding = ledger_simulator.execute_manifest(
            ManifestBuilder::new()
                .lock_fee_from_faucet()
                .call_function(
                    user_factory_package,
                    "UserFactory",
                    "instantiate",
                    (),
                )
                .build(),
            vec![],
        );
        let transaction_receipt = binding.expect_commit_success();

        let user_factory = transaction_receipt
            .new_component_addresses()
            .first()
            .copied()
            .unwrap();

        let user_nft_resource_addresss = transaction_receipt
            .new_resource_addresses()
            .first()
            .copied()
            .unwrap();

        // Create Fidenaro user NFTs
        let [trader_user_nft, follower_user_nft] = [
            (trader_account, "Trader".to_string()),
            (follower_account, "Follower".to_string()),
        ]
        .map(|(account, user_type)| {
            let bio = user_type.clone() + "Bio";
            let pfp = format!("http://{}-pfp.com", user_type);
            let twitter = user_type.clone() + "Twitter";
            let telegram = user_type.clone() + "Telegram";
            let discord = user_type.clone() + "Discord";

            let user_nft_vault_id = ledger_simulator
                .execute_manifest(
                    ManifestBuilder::new()
                        .lock_fee_from_faucet()
                        .call_method(
                            user_factory,
                            "create_new_user",
                            (user_type, bio, pfp, twitter, telegram, discord),
                        )
                        .try_deposit_entire_worktop_or_abort(account, None)
                        .build(),
                    vec![],
                )
                .expect_commit_success()
                .new_vault_addresses()
                .first()
                .copied()
                .unwrap();

            let local_id = ledger_simulator
                .inspect_non_fungible_vault(user_nft_vault_id.into())
                .unwrap()
                .1
                .next()
                .unwrap();

            NonFungibleGlobalId::new(user_nft_resource_addresss, local_id)
        });

        // Set user nft resource address in Fidenaro
        ledger_simulator
            .execute_manifest_without_auth(
                ManifestBuilder::new()
                    .lock_fee_from_faucet()
                    .create_proof_from_account_of_amount(
                        account,
                        admin_badge_address,
                        1,
                    )
                    .call_method(
                        fidenaro,
                        "set_user_token_resource_address",
                        (user_nft_resource_addresss,),
                    )
                    .build(),
            )
            .expect_commit_success();

        // Create a trade vault with the trader account as the manager
        let transaction_receipt = ledger_simulator.execute_manifest(
            ManifestBuilder::new()
                .lock_fee_from_faucet()
                .call_function(
                    trade_vault_package,
                    "TradeVault",
                    "instantiate",
                    (
                        trader_user_nft.local_id().to_string(),
                        "Test Vault",
                        fidenaro,
                        "Vault short description",
                    ),
                )
                .try_deposit_entire_worktop_or_abort(trader_account, None)
                .build(),
            vec![],
        );
        let transaction_result = transaction_receipt.expect_commit_success();

        let trade_vault = transaction_result
            .new_component_addresses()
            .first()
            .copied()
            .unwrap();

        let trade_vault_admin_badge = transaction_result
            .new_resource_addresses()
            .first()
            .copied()
            .unwrap();

        let trade_vault_share_token = transaction_result
            .new_resource_addresses()
            .last()
            .copied()
            .unwrap();

        Self {
            environment: ledger_simulator,
            resources: resource_addresses,
            protocol: ProtocolEntities {
                fidenaro_package_address: fidenaro_package,
                fidenaro,
                user_factory_package_address: user_factory_package,
                user_factory,
                trade_vault_package_address: trade_vault_package,
                trade_vault,
                trade_vault_admin_badge: (
                    trader_public_key.into(),
                    Secp256k1PrivateKey::from_bytes(
                        &trader_private_key.to_bytes(),
                    )
                    .unwrap()
                    .into(),
                    trader_account,
                    trade_vault_admin_badge,
                ),
                trade_vault_share_token,
                oracle_package_address: simple_oracle_package,
                oracle: simple_oracle,
                protocol_owner_badge: (
                    public_key.into(),
                    Secp256k1PrivateKey::from_bytes(&private_key.to_bytes())
                        .unwrap()
                        .into(),
                    account,
                    protocol_owner_badge,
                ),
                protocol_manager_badge: (
                    public_key.into(),
                    private_key.into(),
                    account,
                    protocol_manager_badge,
                ),
                trader: (trader_account, trader_user_nft),
                follower: (follower_account, follower_user_nft),
            },
            radiswap: DexEntities {
                package: radiswap_package,
                pools: radiswap_pools,
                adapter_package: radiswap_adapter_package,
                adapter: radiswap_adapter,
            },
        }
    }
}

impl Default for ScryptoSimulatorEnv {
    fn default() -> Self {
        Self::new()
    }
}