use scrypto::prelude::*;

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
            get_whitelisted_pool_addresses => PUBLIC;
            get_stable_coin_resource_address => PUBLIC;

            // Methods with admin access
            add_token_to_fee_vaults => restrict_to: [admin, OWNER];
            new_pool_to_whitelist => restrict_to: [admin, OWNER];
            remove_pool_from_whitelist => restrict_to: [admin, OWNER];
            add_stable_coin_resource_address => restrict_to: [admin, OWNER];
            change_withdrawal_fee_fidenaro => restrict_to: [admin, OWNER];
            withdraw_collected_fee_fidenaro => restrict_to: [admin, OWNER];
            withdraw_collected_fee_fidenaro_all => restrict_to: [admin, OWNER];
        }
    }
    struct Fidenaro {
        vaults: HashMap<ComponentAddress, (ResourceAddress, ResourceAddress)>, //all vaults in the dapp (<vault, vaultmanagerbadge, sharetoken>)
        whitelisted_pool_addresses: Vec<ComponentAddress>,
        whitelisted_stable_coin_address: Option<ResourceAddress>,
        fidenaro_withdrawal_fee: Decimal,
        fee_vaults: HashMap<ResourceAddress, Vault>,
    }

    impl Fidenaro {
        pub fn instantiate(owner_role: OwnerRole) -> (Global<Fidenaro>, Bucket) {
            let (address_reservation, component_address) =
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

        pub fn get_whitelisted_pool_addresses(&self) -> Vec<ComponentAddress> {
            self.whitelisted_pool_addresses.clone()
        }

        pub fn get_stable_coin_resource_address(&self) -> ResourceAddress {
            self.whitelisted_stable_coin_address.unwrap().clone()
        }

        ////////////////////////////////
        ///methods for fidenaro admin///
        ////////////////////////////////

        pub fn new_pool_to_whitelist(&mut self, pool_address: ComponentAddress) {
            self.whitelisted_pool_addresses.push(pool_address);
        }

        pub fn remove_pool_from_whitelist(&mut self, pool_address: ComponentAddress) {
            self.whitelisted_pool_addresses
                .retain(|&address| address != pool_address);
        }

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
    }
}
