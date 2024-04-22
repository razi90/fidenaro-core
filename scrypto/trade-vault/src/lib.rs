use scrypto::prelude::*;

#[derive(ScryptoSbor, PartialEq)]
pub enum Action {
    Buy,
    Sell,
    Deposit,
    Withdrawal,
}

#[derive(ScryptoSbor)]
pub struct Trade {
    pub epoch: Epoch,
    pub timestamp: Instant,
    pub trade_action: Action,
    pub from: ResourceAddress,
    pub from_amount: Decimal,
    pub to: ResourceAddress,
    pub to_amount: Decimal,
    pub price: Decimal,
}

#[derive(ScryptoSbor)]
pub struct Transaction {
    pub action: Action,
    pub epoch: Epoch,
    pub timestamp: Instant,
    pub amount: Decimal,
    pub user_id: String,
}

#[blueprint]
mod trade_vault {

    extern_blueprint! {
        "package_sim1pk2hfv5krdg668ukjdsuzcwgg0vjaraw5xdrntz57dqv30kg3jp504",
        // "package_tdx_2_1p4at2str4wmwv2g9xm9n3fvsn6v707c26sfsf0pkz8tk3y4gjaan2c",
        Radiswap {
            fn swap(&mut self, input_bucket: Bucket) -> Bucket;
            fn vault_reserves(&self) -> IndexMap<ResourceAddress, Decimal>;
        }
    }

    extern_blueprint! {
        "package_sim1pk2hfv5krdg668ukjdsuzcwgg0vjaraw5xdrntz57dqv30kg3jp504",
        // "package_tdx_2_1p4at2str4wmwv2g9xm9n3fvsn6v707c26sfsf0pkz8tk3y4gjaan2c",
        Fidenaro {
            fn register_vault(&mut self, vault_address: ComponentAddress, user_id: ResourceAddress, share_token_address: ResourceAddress);
            fn get_stable_coin_resource_address(&self) -> ResourceAddress;
            fn get_whitelisted_pool_addresses(&self) -> Vec<ComponentAddress>;
        }
    }

    extern_blueprint! {
        "package_sim1pk2hfv5krdg668ukjdsuzcwgg0vjaraw5xdrntz57dqv30kg3jp504",
        // "package_tdx_2_1p4at2str4wmwv2g9xm9n3fvsn6v707c26sfsf0pkz8tk3y4gjaan2c",
        UserFactory {
            fn get_user_token_resource_address(&self) -> ResourceAddress;
        }
    }

    enable_method_auth! {
        roles {
            fund_manager => updatable_by: [fund_manager, OWNER];
        },
        methods {
            // Methods with public access
            deposit => PUBLIC;
            withdraw => PUBLIC;

            // Methods with admin access
            swap => restrict_to: [fund_manager, OWNER];
            withdraw_collected_fee_fund_manager => restrict_to: [fund_manager, OWNER];
        }
    }

    struct TradeVault {
        manager_user_id: String,
        creation_date: Instant,
        pools: HashMap<ResourceAddress, Vault>,
        fund_manager_badge: ResourceAddress,
        share_token_manager: ResourceManager,
        total_share_tokens: Decimal,
        fees_fund_manager_vault: Vault,
        fidenaro: Global<Fidenaro>,
        trades: Vec<Trade>,
        deposits: Vec<Transaction>,
        withdrawals: Vec<Transaction>,
        followers: HashMap<String, Decimal>,
    }

    impl TradeVault {
        pub fn instantiate_trade_vault(
            user_token: NonFungibleBucket,
            fund_name: String,
            fidenaro: ComponentAddress,
            short_description: String,
        ) -> (
            Global<TradeVault>,
            FungibleBucket,
            ResourceAddress,
            NonFungibleBucket,
        ) {
            let (address_reservation, component_address) =
                Runtime::allocate_component_address(TradeVault::blueprint_id());

            let fund_manager_badge: FungibleBucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .divisibility(DIVISIBILITY_NONE)
                .metadata(metadata! {
                    init {
                        "name" => format!("{} Vault Manager Badge", &fund_name), updatable;
                        "description" => format!("Manager badge for the Fidenaro {} vault.", &fund_name), updatable;
                        "icon_url" => Url::of("https://fidenaro.com/images/LogoFidenaro.png"), locked;
                        "tags" => ["manager", "Fidenaro"], locked;
                    }
                })
                .mint_initial_supply(1);

            let share_token_manager = ResourceBuilder::new_fungible(OwnerRole::None)
                .divisibility(DIVISIBILITY_MAXIMUM)
                .metadata(metadata! {
                    init {
                        "name" => format!("{} Share Tokens", &fund_name), updatable;
                        "description" => format!("Represents investor shares of the Fidenaro {} vault.", &fund_name), updatable;
                        "icon_url" => Url::of("https://fidenaro.com/images/LogoFidenaro.png"), locked;
                        "tags" => ["share", "Fidenaro"], locked;
                    }
                })
                .mint_roles(mint_roles! (
                    minter => rule!(require(global_caller(component_address)));
                    minter_updater => rule!(deny_all);
                ))
                .burn_roles(burn_roles! {
                    burner => rule!(require(global_caller(component_address)));
                    burner_updater => rule!(deny_all);
                })
                .create_with_no_initial_supply();

            let fidenaro: Global<Fidenaro> = fidenaro.into();
            let manager_user_id = user_token.non_fungible_local_id().to_string();

            let fund_metadata_config = metadata! {
                roles {
                    metadata_locker => rule!(
                        require(
                        fund_manager_badge.resource_address()
                        )
                    );
                    metadata_locker_updater => rule!(
                        require(
                        fund_manager_badge.resource_address()
                        )
                    );
                    metadata_setter => rule!(
                        require(
                        fund_manager_badge.resource_address()
                        )
                    );
                    metadata_setter_updater => rule!(
                        require(
                        fund_manager_badge.resource_address()
                        )
                    );
                },
                init {
                    "name" => format!("{}", fund_name), updatable;
                    "description" => format!("{}", short_description), updatable;
                }
            };

            let component = Self {
                manager_user_id,
                creation_date: Clock::current_time(TimePrecision::Minute),
                fund_manager_badge: fund_manager_badge.resource_address(),
                pools: HashMap::new(),
                total_share_tokens: dec!(0),
                share_token_manager,
                fees_fund_manager_vault: Vault::new(share_token_manager.address()),
                fidenaro: fidenaro,
                trades: Vec::new(),
                deposits: Vec::new(),
                withdrawals: Vec::new(),
                followers: HashMap::new(),
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .metadata(fund_metadata_config)
            .roles(roles!(
                fund_manager => rule!(
                    require(
                        fund_manager_badge.resource_address()
                    )
                );
            ))
            .with_address(address_reservation)
            .globalize();

            (
                component,
                fund_manager_badge,
                share_token_manager.address(),
                user_token,
            )
        }

        //////////////////////////
        ///methods for everyone///
        //////////////////////////

        pub fn deposit(&mut self, user_token_proof: Proof, deposit: Bucket) -> Bucket {
            let checked_proof =
                user_token_proof.check(self.fidenaro.get_user_token_resource_address());

            let address: ResourceAddress = deposit.resource_address();
            // Ensure that the type of stable coin passed in matches the type stored in the stable asset pool.
            assert!(
                self.fidenaro.get_stable_coin_resource_address() == address,
                "Wrong token type sent"
            );

            // calculate value of all assets
            let mut total_asset_value = Decimal::zero();

            // we just assume stable coin value is 1$ for now
            if self.pools.contains_key(&address) {
                total_asset_value += self.pools.get(&address).unwrap().amount();
            }

            // calculate value of other assets based on their current price
            for (asset_address, vault) in self.pools.iter() {
                if asset_address != &address {
                    let price = self.get_asset_price(*asset_address);
                    info!("Price: {}", price);
                    total_asset_value += vault.amount() * price;
                }
            }

            info!("Total value of assets: {}", total_asset_value);
            // calculate the ratio of deposit value to total value in vault
            let mut amount_to_mint = Decimal::zero();
            if !total_asset_value.is_zero() {
                let ratio = deposit.amount() / total_asset_value;
                info!("Deposit ratio is {}", ratio);
                info!("Total shares amount is {}", self.total_share_tokens);
                amount_to_mint += self.total_share_tokens * ratio;
            } else {
                amount_to_mint = deposit.amount();
            }

            // Mint the new share tokens.

            let resource_manager = self.share_token_manager;
            let share_tokens = resource_manager.mint(amount_to_mint);
            self.total_share_tokens += share_tokens.amount();

            let user_id = checked_proof
                .as_non_fungible()
                .non_fungible_local_id()
                .to_string();

            self.followers
                .entry(user_id.clone())
                .and_modify(|existing_amount| {
                    *existing_amount += share_tokens.amount();
                })
                .or_insert(share_tokens.amount());

            info!(
                "Minted {} share tokens after a deposit amount of {}",
                share_tokens.amount(),
                deposit.amount()
            );

            let deposit_transaction = Transaction {
                action: Action::Deposit,
                epoch: Runtime::current_epoch(),
                timestamp: Clock::current_time(TimePrecision::Minute),
                amount: deposit.amount(),
                user_id: user_id.clone(),
            };

            self.deposits.push(deposit_transaction);

            let pool = self
                .pools
                .entry(address)
                .or_insert_with(|| Vault::new(address));

            pool.put(deposit);

            share_tokens
        }

        //method that withdraw tokens from the fund relative to how much sharetokens you put into the method.
        pub fn withdraw(&mut self, user_token_proof: Proof, share_tokens: Bucket) -> Vec<Bucket> {
            let checked_proof =
                user_token_proof.check(self.fidenaro.get_user_token_resource_address());

            assert!(
                share_tokens.resource_address() == self.share_token_manager.address(),
                "Wrong tokens sent. You need to send share tokens."
            );

            //take fund from pools and put into a Vec<Bucket> called tokens
            let mut tokens = Vec::new();
            let your_share = share_tokens.amount() / self.total_share_tokens;
            for value in self.pools.values_mut() {
                let amount = your_share * value.amount();
                tokens.push(value.take(amount));
            }

            // update total amount
            self.total_share_tokens -= share_tokens.amount();

            // update follower values
            let user_id = checked_proof
                .as_non_fungible()
                .non_fungible_local_id()
                .to_string();

            let mut remove_entry = false;

            self.followers
                .entry(user_id.clone())
                .and_modify(|existing_amount| {
                    *existing_amount -= share_tokens.amount();
                    if existing_amount.is_zero() {
                        remove_entry = true;
                    }
                });

            if remove_entry {
                self.followers.remove(&user_id);
            }

            // calculate total value of the withdrawn assets
            let mut withdrawal_asset_value = Decimal::zero();
            for token in &tokens {
                if token.resource_address() == self.fidenaro.get_stable_coin_resource_address() {
                    withdrawal_asset_value += token.amount();
                } else {
                    withdrawal_asset_value +=
                        token.amount() * self.get_asset_price(token.resource_address());
                }
            }

            let withdrawal_transaction = Transaction {
                action: Action::Withdrawal,
                epoch: Runtime::current_epoch(),
                timestamp: Clock::current_time(TimePrecision::Minute),
                amount: withdrawal_asset_value,
                user_id: user_id.clone(),
            };

            self.withdrawals.push(withdrawal_transaction);

            // burn sharetokens
            let resource_manager = self.share_token_manager;
            resource_manager.burn(share_tokens);

            tokens
        }

        //////////////////////////////
        ///methods for fund manager///
        //////////////////////////////

        pub fn swap(
            &mut self,
            from_token_address: ResourceAddress,
            from_token_amount: Decimal,
            pool_address: ComponentAddress,
        ) {
            assert!(
                self.fidenaro
                    .get_whitelisted_pool_addresses()
                    .contains(&pool_address),
                "This pool is not whitelisted!"
            );

            assert!(
                self.pools.contains_key(&from_token_address),
                "There is no token in this vault with this address!"
            );

            let from_pool = self.pools.get_mut(&from_token_address).unwrap();
            let from_token = from_pool.take(from_token_amount).as_fungible();

            let mut radiswap: Global<Radiswap> = pool_address.into();

            let to_tokens = radiswap.swap(from_token.into());
            let to_token_address = to_tokens.resource_address();
            let to_token_amount = to_tokens.amount();

            let pool = self
                .pools
                .entry(to_tokens.resource_address())
                .or_insert_with(|| Vault::new(to_tokens.resource_address()));

            pool.put(to_tokens.into());

            // log transaction and trade data

            let mut trade_action = Action::Sell;

            if self.fidenaro.get_stable_coin_resource_address() == from_token_address {
                trade_action = Action::Buy;
            };

            let price;
            if trade_action == Action::Buy {
                price = self.get_asset_price(to_token_address);
            } else {
                price = self.get_asset_price(from_token_address);
            };

            let trade = Trade {
                epoch: Runtime::current_epoch(),
                timestamp: Clock::current_time(TimePrecision::Minute),
                trade_action,
                from: from_token_address,
                from_amount: from_token_amount,
                to: to_token_address,
                to_amount: to_token_amount,
                price,
            };

            self.trades.push(trade);
        }

        pub fn withdraw_collected_fee_fund_manager(&mut self) -> Bucket {
            self.fees_fund_manager_vault.take_all()
        }

        ///////////////////////
        /// private methods ///
        ///////////////////////

        fn get_asset_price(&self, asset_address: ResourceAddress) -> Decimal {
            assert!(!self.fidenaro.get_whitelisted_pool_addresses().is_empty());

            let mut asset_amount = dec!(0);
            let mut stable_coin_amount = dec!(0);

            for pool_address in self.fidenaro.get_whitelisted_pool_addresses() {
                let pool: Global<Radiswap> = pool_address.into();
                let vault_reserves = pool.vault_reserves();
                if vault_reserves.contains_key(&asset_address) {
                    asset_amount += vault_reserves
                        .get(&asset_address)
                        .copied()
                        .unwrap_or(dec!(0));
                    stable_coin_amount += vault_reserves
                        .get(&self.fidenaro.get_stable_coin_resource_address())
                        .copied()
                        .unwrap_or(dec!(0));
                }
            }
            info!("Asset amount is {}", asset_amount);
            info!("Stable coin amount is {}", stable_coin_amount);

            if stable_coin_amount.is_zero() {
                return dec!(0);
            } else {
                let price = stable_coin_amount / asset_amount;
                info!("Asset price is {}", price);
                return price;
            }
        }
    }
}
