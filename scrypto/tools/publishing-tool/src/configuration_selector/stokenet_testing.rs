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

use crate::publishing::*;
use crate::utils::*;
use crate::*;
use radix_common::prelude::*;
use radix_engine_interface::prelude::*;
use radix_transactions::prelude::*;

pub fn stokenet_testing(
    notary_private_key: &PrivateKey,
) -> PublishingConfiguration {
    let notary_account_address =
        ComponentAddress::virtual_account_from_public_key(
            &notary_private_key.public_key(),
        );

    // cSpell:disable
    PublishingConfiguration {
        protocol_configuration: ProtocolConfiguration {
            protocol_resource: XRD,
            entities_metadata: Entities {
                protocol_entities: ProtocolIndexedData {
                    fidenaro: metadata_init! {
                        "name" => "Fidenaro", updatable;
                        "description" => "Fidenaro protocol to manage setting and provide information to trading vaults.", updatable;
                        // Dapp definition will be automatically added by the
                        // publisher accordingly.
                    },
                    simple_oracle: metadata_init! {
                        "name" => "Fidenaro Oracle", updatable;
                        "description" => "The oracle used by the Fidenaro protocol.", updatable;
                        "tags" => vec!["oracle"], updatable;
                        // Dapp definition will be automatically added by the
                        // publisher accordingly.
                    },
                },
                exchange_adapter_entities: ExchangeIndexedData {
                    radiswap: metadata_init! {
                        "name" => "Fidenaro Radiswap Adapter", updatable;
                        "description" => "An adapter used by the Fidenaro protocol to communicate with Radiswap pools.", updatable;
                        // Dapp definition will be automatically added by the
                        // publisher accordingly.
                    },
                },
            },
        },
        dapp_definition_metadata: indexmap! {
            "name".to_owned() => MetadataValue::String("Fidenaro".to_owned()),
            "description".to_owned() => MetadataValue::String("A SocialFi platform offering decentralized copy trading.".to_owned()),
            "icon_url".to_owned() => MetadataValue::Url(UncheckedUrl::of("https://app.fidenaro.com/images/LogoFidenaro.png"))
        },
        transaction_configuration: TransactionConfiguration {
            notary: clone_private_key(notary_private_key),
            fee_payer_information: AccountAndControllingKey::new_virtual_account(
                clone_private_key(notary_private_key),
            ),
        },
        // TODO: Determine where they should be sent to.
        badges: BadgeIndexedData {
            oracle_manager_badge: BadgeHandling::CreateAndSend {
                account_address: notary_account_address,
                metadata_init: metadata_init! {
                    "name" => "Fidenaro Oracle Manager", updatable;
                    "symbol" => "FIDOM", updatable;
                    "description" => "A badge with the authority to update the Oracle prices of the Fidenaro oracle.", updatable;
                    "tags" => vec!["badge"], updatable;
                    // Dapp definition will be automatically added by the
                    // publisher accordingly.
                },
            },
            protocol_manager_badge: BadgeHandling::CreateAndSend {
                account_address: notary_account_address,
                metadata_init: metadata_init! {
                    "name" => "Fidenaro Protocol Manager", updatable;
                    "symbol" => "FIDPM", updatable;
                    "description" => "A badge with the authority to manage the Fidenaro protocol.", updatable;
                    "tags" => vec!["badge"], updatable;
                    // Dapp definition will be automatically added by the
                    // publisher accordingly.
                },
            },
            protocol_owner_badge: BadgeHandling::CreateAndSend {
                account_address: notary_account_address,
                metadata_init: metadata_init! {
                    "name" => "Fidenaro Protocol Owner", updatable;
                    "symbol" => "FIDPO", updatable;
                    "description" => "A badge with owner authority over the Fidenaro protocol.", updatable;
                    "tags" => vec!["badge"], updatable;
                    // Dapp definition will be automatically added by the
                    // publisher accordingly.
                },
            },
        },
        // TODO: Not real resources, just the notXYZ resources.
        user_resources: UserResourceIndexedData {
            bitcoin: UserResourceHandling::UseExisting {
                resource_address: resource_address!(
                    "resource_tdx_2_1thjxkylemqc60sj32sam8arcken7s5ctg7cadg9l82gaucgqxgsv60"
                ),
            },
            ethereum: UserResourceHandling::UseExisting {
                resource_address: resource_address!(
                    "resource_tdx_2_1tha62h4anfcslcxmf2cenw9ezkhnjx7ly223849fvzuwrsm3hxjz3v"
                ),
            },
            usdc: UserResourceHandling::UseExisting {
                resource_address: resource_address!(
                    "resource_tdx_2_1t5e5q2jsn9eqe5ma0gqtpfjzqcmchjze28rfyttzunu3pr6y6t06t7"
                ),
            },
            usdt: UserResourceHandling::UseExisting {
                resource_address: resource_address!(
                    "resource_tdx_2_1t4nwv6aw2n6zt2nx80vxa2h6ynssz75xtjeac4f0hktmapdvh5ve3z"
                ),
            },
        },
        packages: Entities {
            protocol_entities: ProtocolIndexedData {
                fidenaro: PackageHandling::LoadAndPublish {
                    crate_package_name: "fidenaro".to_owned(),
                    metadata: metadata_init! {
                        "name" => "Fidenaro Package", updatable;
                        "description" => "The implementation of the Fidenaro protocol.", updatable;
                        "tags" => Vec::<String>::new(), updatable;
                        // Dapp definition will be automatically added by the
                        // publisher accordingly.
                    },
                    blueprint_name: "Fidenaro".to_owned(),
                },
                simple_oracle: PackageHandling::LoadAndPublish {
                    crate_package_name: "simple-oracle".to_owned(),
                    metadata: metadata_init! {
                        "name" => "Ignition Simple Oracle Package", updatable;
                        "description" => "The implementation of the Oracle used by the Ignition protocol.", updatable;
                        "tags" => vec!["oracle"], updatable;
                        // Dapp definition will be automatically added by the
                        // publisher accordingly.
                    },
                    blueprint_name: "SimpleOracle".to_owned(),
                },
            },
            exchange_adapter_entities: ExchangeIndexedData {
                radiswap: PackageHandling::LoadAndPublish {
                    crate_package_name: "radiswap-adapter".to_owned(),
                    metadata: metadata_init! {
                        "name" => "Fidenaro Radiswap Adapter Package", updatable;
                        "description" => "The implementation of an adapter for Radiswap v2 for the Fidenaro protocol.", updatable;
                        "tags" => vec!["adapter"], updatable;
                        // Dapp definition will be automatically added by the
                        // publisher accordingly.
                    },
                    blueprint_name: "RadiswapAdapter".to_owned(),
                },
            },
        },
        exchange_information: ExchangeIndexedData {
            radiswap: Some(ExchangeInformation {
                blueprint_id: BlueprintId {
                    package_address: package_address!(
                        "package_tdx_2_1phlwavgq39japmv8k2sev946tcs8u2lt8czeyy6rwupuuvwmceapkj"
                    ),
                    blueprint_name: "Radiswap".to_owned(),
                },
                pools: UserResourceIndexedData {
                    bitcoin: PoolHandling::Create,
                    ethereum: PoolHandling::Create,
                    usdc: PoolHandling::Create,
                    usdt: PoolHandling::Create,
                },
            }),
        },
        additional_operation_flags:
            AdditionalOperationFlags::SUBMIT_ORACLE_PRICES_OF_ONE
            .union(
                AdditionalOperationFlags::PROVIDE_INITIAL_LIQUIDITY_TO_OCISWAP_BY_MINTING_USER_RESOURCE
            ),
    }
    // cSpell:enable
}
