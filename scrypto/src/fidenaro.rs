use scrypto::prelude::*;

#[derive(ScryptoSbor, NonFungibleData)]
pub struct User {
    #[mutable]
    pub user_name: String,
    #[mutable]
    pub bio: String,
    #[mutable]
    pub pfp_url: Url,
    #[mutable]
    pub twitter: String,
    #[mutable]
    pub telegram: String,
    #[mutable]
    pub discord: String,
}

#[blueprint]
mod fidenaro {

    enable_method_auth! {
        roles {
            admin => updatable_by: [admin, OWNER];
        },
        methods {
            // Methods with public access
            new_user => PUBLIC;
            new_vault => PUBLIC;
            get_vaults => PUBLIC;
            get_fidenaro_withdrawal_fee => PUBLIC;
            get_whitelisted_pool_addresses => PUBLIC;
            get_stable_coin_resource_address => PUBLIC;
            get_user_token_resource_address => PUBLIC;

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
        user_token_manager: ResourceManager,
        user_count: u64,
    }

    impl Fidenaro {
        pub fn instantiate(owner_role: OwnerRole) -> (Global<Fidenaro>, Bucket) {
            let (address_reservation, component_address) =
                Runtime::allocate_component_address(Fidenaro::blueprint_id());

            let admin_badge: Bucket = ResourceBuilder::new_fungible(OwnerRole::None)
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

            let user_token_manager =
                ResourceBuilder::new_integer_non_fungible::<User>(OwnerRole::None)
                    .metadata(metadata!(
                        init {
                            "name" => "Fidenaro User", locked;
                            "description" => "A user NFT for Fidenaro users", locked;
                        }
                    ))
                    .mint_roles(mint_roles! (
                        minter => rule!(require(global_caller(component_address)));
                        minter_updater => rule!(deny_all);
                    ))
                    .burn_roles(burn_roles! {
                        burner => rule!(require(global_caller(component_address)));
                        burner_updater => rule!(deny_all);
                    })
                    .create_with_no_initial_supply();

            let component: Global<Fidenaro> = Self {
                vaults: HashMap::new(),
                whitelisted_pool_addresses: Vec::new(),
                whitelisted_stable_coin_address: None,
                fidenaro_withdrawal_fee: dec!(1),
                fee_vaults: HashMap::new(),
                user_token_manager,
                user_count: u64::zero(),
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

        //////////////////////////
        ///methods for everyone///
        //////////////////////////

        pub fn new_user(
            &mut self,
            user_name: String,
            bio: String,
            pfp_url: String,
            twitter: String,
            telegram: String,
            discord: String,
        ) -> Bucket {
            let new_user = User {
                user_name,
                bio,
                pfp_url: Url::of(pfp_url),
                twitter,
                telegram,
                discord,
            };
            let user_token = self.user_token_manager.mint_non_fungible(
                &NonFungibleLocalId::Integer(self.user_count.into()),
                new_user,
            );

            self.user_count += 1;

            user_token
        }

        pub fn new_vault(
            &mut self,
            user_token: NonFungibleBucket,
            vault_name: String,
            short_description: String,
        ) -> (FungibleBucket, NonFungibleBucket) {
            assert!(
                user_token.resource_address() == self.user_token_manager.address(),
                "Wrong user token."
            );

            let (vault, vault_manager_badge, share_token_address, user_token) =
                crate::trade_vault::trade_vault::TradeVault::instantiate_trade_vault(
                    user_token,
                    vault_name,
                    Runtime::global_address(),
                    short_description,
                )
                .into();

            self.vaults.insert(
                vault.address(),
                (vault_manager_badge.resource_address(), share_token_address),
            );

            (vault_manager_badge, user_token)
        }

        pub fn get_vaults(
            &mut self,
        ) -> HashMap<ComponentAddress, (ResourceAddress, ResourceAddress)> {
            self.vaults.clone()
        }

        pub fn get_fidenaro_withdrawal_fee(&mut self) -> Decimal {
            self.fidenaro_withdrawal_fee
        }

        pub fn get_whitelisted_pool_addresses(&mut self) -> Vec<ComponentAddress> {
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

        pub fn get_user_token_resource_address(&self) -> ResourceAddress {
            self.user_token_manager.address()
        }
    }
}
