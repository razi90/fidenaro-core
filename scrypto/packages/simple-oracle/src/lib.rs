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

use ports_interface::prelude::OracleAdapterInterfaceTrait;
use scrypto::prelude::*;
use scrypto_interface::*;

#[derive(ScryptoSbor, Clone, Debug, PartialEq)]
pub struct AccumulatedObservation {
    /// The timestamp of the observation.
    pub timestamp: u64,
    /// The accumulated logarithmic value of the price square root.
    pub price_sqrt_log_acc: Decimal,
}

#[derive(
    Copy, Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, ScryptoSbor,
)]
pub struct Pair {
    pub base: ResourceAddress,
    pub quote: ResourceAddress,
}

#[derive(Copy, Clone, Debug, PartialEq, Eq, ScryptoSbor)]
pub struct PairPriceEntry {
    pub price: Decimal,
    /// This is an instant of when did the component observe the submitted
    /// prices and not when they were actually observed by the oracle
    /// off-ledger software.
    pub observed_by_component_at: Instant,
}

#[blueprint_with_traits]
#[types(Pair, PairPriceEntry)]
mod simple_oracle {

    enable_method_auth! {
        roles {
            oracle_manager => updatable_by: [oracle_manager];
        },
        methods {
            insert_pool => restrict_to: [oracle_manager];
            update_pool => restrict_to: [oracle_manager];
            get_price => PUBLIC;
        }
    }

    pub struct SimpleOracle {
        pools: KeyValueStore<Pair, ComponentAddress>,
    }

    impl SimpleOracle {
        pub fn instantiate(
            oracle_manager: AccessRule,
            metadata_init: MetadataInit,
            owner_role: OwnerRole,
            address_reservation: Option<GlobalAddressReservation>,
        ) -> Global<SimpleOracle> {
            let address_reservation =
                address_reservation.unwrap_or_else(|| {
                    Runtime::allocate_component_address(BlueprintId {
                        package_address: Runtime::package_address(),
                        blueprint_name: Runtime::blueprint_name(),
                    })
                    .0
                });

            Self {
                pools: KeyValueStore::new(),
            }
            .instantiate()
            .prepare_to_globalize(owner_role)
            .roles(roles! {
                oracle_manager => oracle_manager;
            })
            .metadata(ModuleConfig {
                init: metadata_init,
                roles: Default::default(),
            })
            .with_address(address_reservation)
            .globalize()
        }

        pub fn insert_pool(
            &mut self,
            pair: Pair,
            pool_address: ComponentAddress,
        ) {
            self.pools.insert(pair, pool_address);
        }

        pub fn update_pool(
            &mut self,
            pair: Pair,
            pool_address: ComponentAddress,
        ) {
            let entry = self.pools.get_mut(&pair);
            if let Some(mut old_pool_address) = entry {
                info!(
                    "Update pool {:?} for existing pair for {:?}",
                    pair, pool_address
                );
                *old_pool_address = pool_address;
            } else {
                panic!("Pair not found in the pools map.");
            }
        }
    }

    impl OracleAdapterInterfaceTrait for SimpleOracle {
        fn get_price(
            &self,
            base: ResourceAddress,
            quote: ResourceAddress,
        ) -> Decimal {
            // Fetch the pool address using the ordered pair (base, quote)
            let pool_address = *self
                .pools
                .get(&Pair { base, quote })
                .expect("Price not found for this resource");

            let pool: Global<AnyComponent> = pool_address.into();

            let price: Decimal = match pool
                .call::<(), Option<u64>>("oldest_observation_at", &())
            {
                // An observation was found
                Some(timestamp) => pool
                    .call::<(u64,), AccumulatedObservation>(
                        "observation",
                        &(timestamp,),
                    )
                    .price_sqrt_log_acc
                    .checked_powi(2)
                    .expect("Overflow error."),
                None => {
                    // No observation was found. Use price_sqrt instead
                    pool.call::<(), PreciseDecimal>("price_sqrt", &())
                        .checked_powi(2)
                        .and_then(|value| Decimal::try_from(value).ok())
                        .expect("Overflow error.")
                }
            };

            // Invert the price if base was XRD
            if base == XRD {
                Decimal::ONE / price
            } else {
                price
            }
        }
    }
}
