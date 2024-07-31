use ports_interface::prelude::*;
use scrypto::prelude::*;

type PoolAdapter = PoolAdapterInterfaceScryptoStub;
type OracleAdapter = OracleAdapterInterfaceScryptoStub;

#[derive(Debug, ScryptoSbor, PartialEq)]
pub enum Action {
    Buy,
    Sell,
    Deposit,
    Withdrawal,
}

#[derive(Debug, ScryptoSbor)]
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

#[derive(Debug, ScryptoSbor)]
pub struct Transaction {
    pub action: Action,
    pub epoch: Epoch,
    pub timestamp: Instant,
    pub amount: Decimal,
    pub user_id: String,
}

#[derive(Debug, ScryptoSbor)]
pub struct UserPosition {
    pub share_amount: Decimal,
    pub total_deposit: Decimal,
}

#[blueprint]
mod trade_vault {

    extern_blueprint! {
        "package_sim1pkuj90ee40aujtm7p7jpzlr30jymfu5mgzkaf36t626my7ftuhjmnx",
        Fidenaro {
            fn get_user_token_resource_address(&self) -> ResourceAddress;
            fn get_whitelisted_pool_addresses(&self) -> Vec<ComponentAddress>;
            fn get_pool_adapter(&self, pool_address: ComponentAddress) -> Option<PoolAdapter>;
            fn get_oracle_adapter(&self) -> Option<OracleAdapter>;
            fn get_fee_rate(&self) -> Decimal;
            fn deposit_fee(&mut self, fee: Bucket);
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
            withdraw_collected_trader_fee => restrict_to: [fund_manager, OWNER];
        }
    }

    struct TradeVault {
        manager_user_id: String,
        creation_date: Instant,
        assets: HashMap<ResourceAddress, Vault>,
        fund_manager_badge: ResourceAddress,
        share_token_manager: ResourceManager,
        total_share_tokens: Decimal,
        trader_fee_vaults: KeyValueStore<ResourceAddress, Vault>,
        fidenaro: Global<Fidenaro>,
        trades: Vec<Trade>,
        deposits: Vec<Transaction>,
        withdrawals: Vec<Transaction>,
        followers: HashMap<String, Decimal>,
        // positions: KeyValueStore<ResourceAddress, Vault>,
        user_positions: KeyValueStore<String, UserPosition>,
    }

    impl TradeVault {
        pub fn instantiate(
            user_token_id: String,
            vault_name: String,
            fidenaro: ComponentAddress,
            short_description: String,
        ) -> (Global<TradeVault>, FungibleBucket) {
            let (address_reservation, component_address) =
                Runtime::allocate_component_address(TradeVault::blueprint_id());

            let fund_manager_badge: FungibleBucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .divisibility(DIVISIBILITY_NONE)
                .metadata(metadata! {
                    init {
                        "name" => format!("{} Vault Manager Badge", &vault_name), updatable;
                        "description" => format!("Manager badge for the Fidenaro {} vault.", &vault_name), updatable;
                        "icon_url" => Url::of("https://fidenaro.com/images/LogoFidenaro.png"), locked;
                        "tags" => ["manager", "Fidenaro"], locked;
                    }
                })
                .mint_initial_supply(1);

            let share_token_manager = ResourceBuilder::new_fungible(OwnerRole::None)
                .divisibility(DIVISIBILITY_MAXIMUM)
                .metadata(metadata! {
                    init {
                        "name" => format!("{} Share Tokens", &vault_name), updatable;
                        "description" => format!("Represents investor shares of the Fidenaro {} vault.", &vault_name), updatable;
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
            let manager_user_id = user_token_id;

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
                    "name" => format!("{}", vault_name), updatable;
                    "description" => format!("{}", short_description), updatable;
                }
            };

            let component = Self {
                manager_user_id,
                creation_date: Clock::current_time(TimePrecision::Minute),
                fund_manager_badge: fund_manager_badge.resource_address(),
                assets: HashMap::new(),
                total_share_tokens: dec!(0),
                share_token_manager,
                trader_fee_vaults: KeyValueStore::new(),
                fidenaro: fidenaro,
                trades: Vec::new(),
                deposits: Vec::new(),
                withdrawals: Vec::new(),
                followers: HashMap::new(),
                user_positions: KeyValueStore::new(),
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

            (component, fund_manager_badge)
        }

        //////////////////////////
        ///methods for everyone///
        //////////////////////////

        pub fn deposit(
            &mut self,
            user_token_proof: Proof,
            deposit: Bucket,
        ) -> Bucket {
            let checked_proof = user_token_proof
                .check(self.fidenaro.get_user_token_resource_address());

            let address: ResourceAddress = deposit.resource_address();

            assert!(
                XRD == address,
                "Wrong token type sent. Only XRD can be deposited."
            );

            // calculate value of all assets
            let mut total_asset_value = Decimal::zero();

            if self.assets.contains_key(&XRD) {
                total_asset_value +=
                    self.assets.get(&address).unwrap().amount();
            }

            // calculate value of other assets based on their current price
            for (asset_address, vault) in self.assets.iter() {
                if asset_address != &XRD {
                    let (price, _) = self
                        .fidenaro
                        .get_oracle_adapter()
                        .unwrap()
                        .get_price(*asset_address, XRD);
                    info!("Price: {}", price);
                    total_asset_value += vault.amount() * price;
                }
            }

            info!("Total value of assets in XRD: {}", total_asset_value);
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

            // self.followers
            //     .entry(user_id.clone())
            //     .and_modify(|existing_amount| {
            //         *existing_amount += share_tokens.amount();
            //     })
            //     .or_insert(share_tokens.amount());

            info!(
                "Minted {} share tokens after a deposit amount of {}",
                share_tokens.amount(),
                deposit.amount()
            );

            let entry = self.user_positions.get_mut(&user_id);
            if let Some(mut user_position) = entry {
                user_position.share_amount += share_tokens.amount();
                user_position.total_deposit += deposit.amount();
            } else {
                drop(entry);
                self.user_positions.insert(
                    user_id.clone(),
                    UserPosition {
                        share_amount: share_tokens.amount(),
                        total_deposit: deposit.amount(),
                    },
                );
            }

            let deposit_transaction = Transaction {
                action: Action::Deposit,
                epoch: Runtime::current_epoch(),
                timestamp: Clock::current_time(TimePrecision::Minute),
                amount: deposit.amount(),
                user_id: user_id.clone(),
            };

            self.deposits.push(deposit_transaction);

            let pool = self
                .assets
                .entry(address)
                .or_insert_with(|| Vault::new(address));

            pool.put(deposit);

            share_tokens
        }

        //method that withdraw tokens from the fund relative to how much sharetokens you put into the method.
        pub fn withdraw(
            &mut self,
            user_token_proof: Proof,
            share_tokens: Bucket,
        ) -> Vec<Bucket> {
            // Validate user token proof and share tokens
            let checked_proof =
                self.validate_user_token_proof(user_token_proof);
            self.validate_share_tokens(&share_tokens);

            // Get user ID and user-specific data
            let user_id = self.get_user_id(&checked_proof);
            let (user_vault_equity_in_percent, user_withdrawal_proportion) =
                self.calculate_user_positions(&user_id, &share_tokens);

            // Calculate the total asset value and the withdrawal value for the user
            let total_user_asset_value = self
                .calculate_total_user_asset_value(user_vault_equity_in_percent);
            let withdrawal_value =
                total_user_asset_value * user_withdrawal_proportion;

            // Withdraw assets
            let mut tokens = self.withdraw_assets(user_withdrawal_proportion);

            // Calculate profit on the amount which is withdrawn and deposit traders fee if positive
            let profit_on_withdrawal = self.calculate_profit_on_withdrawal(
                &user_id,
                total_user_asset_value,
                user_withdrawal_proportion,
            );

            if profit_on_withdrawal.is_positive() {
                self.substract_trader_fee(&mut tokens);
            };

            // Update user positions
            self.update_user_positions(
                &user_id,
                &share_tokens,
                user_withdrawal_proportion,
            );

            // Record the withdrawal transaction
            self.record_withdrawal_transaction(&user_id, withdrawal_value);

            // Burn the share tokens
            self.burn_share_tokens(share_tokens);

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
                self.assets.contains_key(&from_token_address),
                "This asset cannot be swapped as it is not part of the !"
            );

            // withdraw tokens from vault
            let from_vault = self.assets.get_mut(&from_token_address).unwrap();
            let mut from_token = from_vault.take(from_token_amount);

            // Take fidenaro fee
            let fee_rate = self.fidenaro.get_fee_rate();
            let fee_amount = from_token.amount() * fee_rate;
            let fee = from_token.take(fee_amount);
            self.fidenaro.deposit_fee(fee);

            info!("Fee amount of {} was deposited to Fidenaro.", fee_amount);

            // swap tokens
            let mut pool_adapter =
                self.fidenaro.get_pool_adapter(pool_address).unwrap();

            let to_tokens = pool_adapter.swap(pool_address, from_token);
            let to_token_address = to_tokens.resource_address();
            let to_token_amount = to_tokens.amount();

            let pool = self
                .assets
                .entry(to_tokens.resource_address())
                .or_insert_with(|| Vault::new(to_tokens.resource_address()));

            // deposit tokens into vault
            pool.put(to_tokens.into());

            // log transaction and trade data
            let trade_action = if from_token_address == XRD {
                Action::Buy
            } else {
                Action::Sell
            };

            let price = if trade_action == Action::Buy {
                self.fidenaro
                    .get_oracle_adapter()
                    .unwrap()
                    .get_price(to_token_address, XRD)
                    .0
            } else {
                self.fidenaro
                    .get_oracle_adapter()
                    .unwrap()
                    .get_price(from_token_address, XRD)
                    .0
            };

            info!("Swapped at the price of {}", price);

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

        pub fn withdraw_collected_trader_fee(
            &mut self,
            resource_address: ResourceAddress,
        ) -> Bucket {
            self.trader_fee_vaults
                .get_mut(&resource_address)
                .unwrap()
                .take_all()
        }

        // Helper Functions

        fn validate_user_token_proof(
            &self,
            user_token_proof: Proof,
        ) -> CheckedProof {
            user_token_proof
                .check(self.fidenaro.get_user_token_resource_address())
        }

        fn validate_share_tokens(&self, share_tokens: &Bucket) {
            assert!(
                share_tokens.resource_address()
                    == self.share_token_manager.address(),
                "Wrong tokens sent. You need to send share tokens."
            );
        }

        fn get_user_id(&self, checked_proof: &CheckedProof) -> String {
            checked_proof
                .as_non_fungible()
                .non_fungible_local_id()
                .to_string()
        }

        fn calculate_user_positions(
            &self,
            user_id: &String,
            share_tokens: &Bucket,
        ) -> (Decimal, Decimal) {
            let total_user_share_token_amount =
                self.user_positions.get(user_id).unwrap().share_amount;
            let user_vault_equity_in_percent =
                total_user_share_token_amount / self.total_share_tokens;
            let user_withdrawal_proportion =
                share_tokens.amount() / total_user_share_token_amount;
            (user_vault_equity_in_percent, user_withdrawal_proportion)
        }

        fn calculate_total_user_asset_value(
            &self,
            user_vault_equity_in_percent: Decimal,
        ) -> Decimal {
            let mut total_user_asset_value = Decimal::zero();

            if let Some(xrd_vault) = self.assets.get(&XRD) {
                total_user_asset_value += xrd_vault.amount();
            }

            for (asset_address, vault) in &self.assets {
                if asset_address != &XRD {
                    let (price, _) = self
                        .fidenaro
                        .get_oracle_adapter()
                        .unwrap()
                        .get_price(*asset_address, XRD);
                    info!("Price: {}", price);
                    total_user_asset_value +=
                        user_vault_equity_in_percent * vault.amount() * price;
                }
            }

            total_user_asset_value
        }

        fn calculate_profit_on_withdrawal(
            &self,
            user_id: &String,
            total_user_asset_value: Decimal,
            user_withdrawal_proportion: Decimal,
        ) -> Decimal {
            let user_position = self.user_positions.get(user_id).unwrap();
            let profit = total_user_asset_value - user_position.total_deposit;
            let profit_on_withdrawal = if profit.is_positive() {
                user_withdrawal_proportion * profit
            } else {
                dec!(0)
            };
            profit_on_withdrawal
        }

        fn withdraw_assets(
            &mut self,
            withdrawal_without_performance_fee: Decimal,
        ) -> Vec<Bucket> {
            let mut tokens = Vec::new();

            for value in self.assets.values_mut() {
                tokens.push(value.take(withdrawal_without_performance_fee));
            }

            tokens
        }

        fn substract_trader_fee(&mut self, assets: &mut Vec<Bucket>) {
            for value in assets {
                let trader_fee = value.amount() * dec!(0.1);
                let entry =
                    self.trader_fee_vaults.get_mut(&value.resource_address());
                if let Some(mut vault) = entry {
                    vault.put(value.take(trader_fee));
                } else {
                    drop(entry);
                    self.trader_fee_vaults.insert(
                        value.resource_address(),
                        Vault::with_bucket(value.take(trader_fee)),
                    );
                }
            }
        }

        fn update_user_positions(
            &mut self,
            user_id: &String,
            share_tokens: &Bucket,
            user_withdrawal_proportion: Decimal,
        ) {
            let mut remove_entry = false;
            if let Some(mut user_position) =
                self.user_positions.get_mut(user_id)
            {
                user_position.share_amount -= share_tokens.amount();
                let new_total_deposit = user_position.total_deposit
                    * (1 - user_withdrawal_proportion);
                user_position.total_deposit -= new_total_deposit;

                if user_position.share_amount.is_zero() {
                    remove_entry = true;
                }
            }
            if remove_entry {
                self.user_positions.remove(&user_id);
            }
        }

        fn record_withdrawal_transaction(
            &mut self,
            user_id: &String,
            withdrawal_asset_value: Decimal,
        ) {
            let withdrawal_transaction = Transaction {
                action: Action::Withdrawal,
                epoch: Runtime::current_epoch(),
                timestamp: Clock::current_time(TimePrecision::Minute),
                amount: withdrawal_asset_value,
                user_id: user_id.clone(),
            };

            self.withdrawals.push(withdrawal_transaction);
        }

        fn burn_share_tokens(&mut self, share_tokens: Bucket) {
            self.total_share_tokens -= share_tokens.amount();
            self.share_token_manager.burn(share_tokens);
        }
    }
}
