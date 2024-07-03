use ports_interface::prelude::*;
use scrypto::prelude::*;

type PoolAdapter = PoolAdapterInterfaceScryptoStub;

/// Represents the information of pools belonging to a particular blueprint that
/// the Fidenaro component stores in its state. This type is not public as it
/// does not need to be.
#[derive(Clone, Debug, PartialEq, Eq, ScryptoSbor, ManifestSbor)]
struct StoredPoolBlueprintInformation {
    /// The adapter to utilize when making calls to pools belonging to this
    /// blueprint.
    pub adapter: PoolAdapter,

    /// A map of the pools that the protocol allows trading with. A pool
    /// that is not found in this map for their corresponding blueprint will
    /// not be allowed to be traded with.
    pub allowed_pools: IndexMap<ComponentAddress, (ResourceAddress, ResourceAddress)>,
}

/// Represents the information of pools belonging to a particular blueprint.
#[derive(Clone, Debug, PartialEq, Eq, ScryptoSbor, ManifestSbor)]
pub struct PoolBlueprintInformation {
    /// The adapter to utilize when making calls to pools belonging to this
    /// blueprint.
    pub adapter: ComponentAddress,

    /// A vector of the pools that the protocol allows to trade with. A pool
    /// that is not found in this list for their corresponding blueprint will
    /// not be allowed to be traded with.
    pub allowed_pools: IndexSet<ComponentAddress>,
}

#[blueprint]
mod fidenaro {

    enable_method_auth! {
        roles {
            admin => updatable_by: [admin, OWNER];
        },
        methods {
            // Methods with public access
            register_vault => PUBLIC;
            get_vaults => PUBLIC;
            get_fidenaro_withdrawal_fee => PUBLIC;
            get_stable_coin_resource_address => PUBLIC;
            get_user_token_resource_address => PUBLIC;
            checked_get_pool_adapter => PUBLIC;

            // Methods with admin access
            add_token_to_fee_vaults => restrict_to: [admin, OWNER];
            add_stable_coin_resource_address => restrict_to: [admin, OWNER];
            change_withdrawal_fee_fidenaro => restrict_to: [admin, OWNER];
            withdraw_collected_fee_fidenaro => restrict_to: [admin, OWNER];
            withdraw_collected_fee_fidenaro_all => restrict_to: [admin, OWNER];
            set_user_token_resource_address => restrict_to: [admin, OWNER];
            update_pool_information => restrict_to: [admin, OWNER];
        }
    }

    struct Fidenaro {
        vaults: HashMap<ComponentAddress, (ResourceAddress, ResourceAddress)>, //all vaults in the dapp (<vault, vaultmanagerbadge, sharetoken>)
        whitelisted_pool_addresses: Vec<ComponentAddress>,
        whitelisted_stable_coin_address: Option<ResourceAddress>,
        fidenaro_withdrawal_fee: Decimal,
        fee_vaults: HashMap<ResourceAddress, Vault>,
        user_token_address: Option<ResourceAddress>,
        pool_information: KeyValueStore<BlueprintId, StoredPoolBlueprintInformation>,
    }

    impl Fidenaro {
        pub fn instantiate(owner_role: OwnerRole) -> (Global<Fidenaro>, Bucket) {
            let (address_reservation, _component_address) =
                Runtime::allocate_component_address(Fidenaro::blueprint_id());

            let admin_badge: Bucket = ResourceBuilder::new_fungible(owner_role.clone())
                .divisibility(DIVISIBILITY_NONE)
                .metadata(metadata! {
                    init {
                        "name" => "Fidenaro admin badge", updatable;
                        "description" => "Administrator badge for the Fidenaro component", updatable;
                        "info_url" => Url::of("https://fidenaro.com"), updatable;
                        "icon_url" => Url::of("https://fidenaro.com/images/LogoFidenaro.png"), updatable;
                    }
                })
                .mint_initial_supply(1)
                .into();

            let component: Global<Fidenaro> = Self {
                vaults: HashMap::new(),
                whitelisted_pool_addresses: Vec::new(),
                whitelisted_stable_coin_address: None,
                fidenaro_withdrawal_fee: dec!(1),
                fee_vaults: HashMap::new(),
                user_token_address: None,
                pool_information: KeyValueStore::new(),
            }
            .instantiate()
            .prepare_to_globalize(owner_role.clone())
            .roles(roles!(
                admin => rule!(
                    require(
                        admin_badge.resource_address()
                    )
                );
            ))
            .with_address(address_reservation)
            .globalize();

            return (component, admin_badge);
        }

        //vault make use of this method to deposit the fee to the correct vault
        //if other people decide to use this method it is just free money to the fidenaro admin :D
        pub fn add_token_to_fee_vaults(&mut self, token: Bucket) {
            info!("Received fee!");
            let resource_address = token.resource_address();

            if !self.fee_vaults.contains_key(&resource_address) {
                let key = resource_address;
                let value = Vault::new(resource_address);
                self.fee_vaults.insert(key, value);
            }

            self.fee_vaults
                .get_mut(&resource_address)
                .unwrap()
                .put(token);
        }

        pub fn register_vault(
            &mut self,
            vault_address: ComponentAddress,
            user_id: ResourceAddress,
            share_token_address: ResourceAddress,
        ) {
            self.vaults
                .insert(vault_address, (user_id, share_token_address));
        }

        pub fn get_vaults(
            &mut self,
        ) -> HashMap<ComponentAddress, (ResourceAddress, ResourceAddress)> {
            self.vaults.clone()
        }

        pub fn get_fidenaro_withdrawal_fee(&self) -> Decimal {
            self.fidenaro_withdrawal_fee
        }

        pub fn get_stable_coin_resource_address(&self) -> ResourceAddress {
            self.whitelisted_stable_coin_address.unwrap().clone()
        }

        pub fn get_user_token_resource_address(&self) -> ResourceAddress {
            self.user_token_address.unwrap().clone()
        }

        ////////////////////////////////
        ///methods for fidenaro admin///
        ////////////////////////////////

        pub fn add_stable_coin_resource_address(
            &mut self,
            stable_coin_resource_address: ResourceAddress,
        ) {
            self.whitelisted_stable_coin_address = Some(stable_coin_resource_address)
        }

        pub fn change_withdrawal_fee_fidenaro(&mut self, new_fee: Decimal) {
            assert!(
                new_fee >= dec!(0) && new_fee <= dec!(5),
                "Fee need to be in range of 0% to 5%."
            );
            self.fidenaro_withdrawal_fee = new_fee;
        }

        pub fn withdraw_collected_fee_fidenaro(&mut self, address: ResourceAddress) -> Bucket {
            self.fee_vaults.get_mut(&address).unwrap().take_all()
        }

        pub fn withdraw_collected_fee_fidenaro_all(&mut self) -> Vec<Bucket> {
            let mut tokens = Vec::new();
            for vault in self.fee_vaults.values_mut() {
                tokens.push(vault.take_all());
            }
            tokens
        }

        pub fn set_user_token_resource_address(
            &mut self,
            user_token_resource_address: ResourceAddress,
        ) {
            self.user_token_address = Some(user_token_resource_address);
        }

        /// Inserts the pool information, adding it to the protocol, performing
        /// an upsert.
        ///
        /// # Access
        ///
        /// Requires the `protocol_manager` or `protocol_owner` roles.
        ///
        /// # Arguments
        ///
        /// * `blueprint_id`: [`BlueprintId`] - The id of the pool blueprint
        /// to add the information for.
        /// * `PoolBlueprintInformation`: [`PoolBlueprintInformation`] The
        /// protocol information related to the blueprint.
        pub fn update_pool_information(
            &mut self,
            blueprint_id: BlueprintId,
            pool_information: PoolBlueprintInformation,
        ) {
            let pool_information = StoredPoolBlueprintInformation {
                adapter: PoolAdapter::from(pool_information.adapter),
                allowed_pools: pool_information
                    .allowed_pools
                    .into_iter()
                    .map(|pool_component_address| {
                        let mut adapter = PoolAdapter::from(pool_information.adapter);

                        let resources = adapter.resource_addresses(pool_component_address);

                        (pool_component_address, resources)
                    })
                    .collect(),
            };

            self.pool_information.insert(blueprint_id, pool_information)
        }

        /// Gets the adapter and the liquidity receipt given a pool address.
        ///
        /// This method first gets the pool information associated with the pool
        /// blueprint and then checks to ensure that the pool is in the allow
        /// list of pools. If it is, it returns the adapter and the resource
        /// manager reference of the liquidity receipt.
        ///
        /// If a [`None`] is returned it means that no pool information was
        /// found for the pool and that it has no corresponding adapter that
        /// we can use.
        ///
        /// # Panics
        ///
        /// * If the pool is not in the list of allowed pools.
        ///
        /// # Arguments
        ///
        /// `pool_address`: [`ComponentAddress`] - The address of the component
        /// to get the adapter and liquidity receipt for.
        ///
        /// # Returns
        ///
        /// * [`PoolAdapter`] - The adapter to use for the pool.
        /// * [`ResourceManager`] - The resource manager reference of the
        /// liquidity receipt token.
        /// * [`(ResourceAddress, ResourceAddress)`] - A tuple of the resource
        /// addresses of the pool.
        ///
        /// # Note
        ///
        /// The [`KeyValueEntryRef<'_, PoolBlueprintInformation>`] is returned
        /// to allow the references of the addresses to remain.
        pub fn checked_get_pool_adapter(
            &self,
            pool_address: ComponentAddress,
        ) -> Option<PoolAdapter> {
            let blueprint_id = ScryptoVmV1Api::object_get_blueprint_id(pool_address.as_node_id());
            let entry = self
                .pool_information
                .get(&blueprint_id)
                .expect("Blueprint ID not found in pool information");

            if entry.allowed_pools.contains_key(&pool_address) {
                Some(entry.adapter)
            } else {
                panic!("Pool address not found in allowed pools");
            }
        }
    }
}
