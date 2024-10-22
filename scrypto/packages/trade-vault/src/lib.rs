use ports_interface::prelude::*;
use scrypto::prelude::*;

type PoolAdapter = PoolAdapterInterfaceScryptoStub;
type OracleAdapter = OracleAdapterInterfaceScryptoStub;

#[derive(Debug, ScryptoSbor)]
pub struct UserPosition {
    pub share_amount: Decimal,
    pub total_deposit: Decimal,
}

#[derive(ScryptoSbor, ScryptoEvent)]
struct TradeEvent {
    from: ResourceAddress,
    from_amount: Decimal,
    to: ResourceAddress,
    to_amount: Decimal,
}

#[blueprint]
#[events(TradeEvent)]
mod trade_vault {

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
        fidenaro: Global<AnyComponent>,
        user_positions: KeyValueStore<String, UserPosition>,
    }

    impl TradeVault {
        pub fn instantiate(
            user_token_proof: Proof,
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

            let fidenaro: Global<AnyComponent> = fidenaro.into();

            // Get user ID
            let checked_proof = user_token_proof
                .check(fidenaro.call("get_user_token_resource_address", &()));

            let manager_user_id = checked_proof
                .as_non_fungible()
                .non_fungible_local_id()
                .to_string();

            // Register vault
            fidenaro
                .call::<(ComponentAddress, ResourceAddress, ResourceAddress), ()>(
                    "register_vault",
                    &(
                        component_address,
                        fund_manager_badge.resource_address(),
                        share_token_manager.address(),
                    ),
                );

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
                fidenaro,
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
            // Validate user token proof and deposit tokens
            let checked_proof =
                self.validate_user_token_proof(user_token_proof);
            self.validate_deposit_tokens(&deposit);

            // Get user ID
            let user_id = self.get_user_id(&checked_proof);

            // calculate value of all assets
            let mut total_asset_value = Decimal::zero();

            if let Some(asset) = self.assets.get(&XRD) {
                if let Some(new_total) =
                    total_asset_value.checked_add(asset.amount())
                {
                    total_asset_value = new_total;
                } else {
                    panic!("Value overflow during deposit. Abort.")
                }
            }

            // calculate value of other assets based on their current price
            for (asset_address, vault) in self.assets.iter() {
                if asset_address != &XRD {
                    let price = self
                        .fidenaro
                        .call::<(), Option<OracleAdapter>>(
                            "get_oracle_adapter",
                            &(),
                        )
                        .unwrap()
                        .get_price(*asset_address, XRD);
                    info!("Price: {}", price);
                    let asset_value =
                        vault.amount().checked_mul(price).unwrap();
                    total_asset_value =
                        total_asset_value.checked_add(asset_value).unwrap();
                }
            }

            info!("Total value of assets in XRD: {}", total_asset_value);
            // calculate the ratio of deposit value to total value in vault
            let mut amount_to_mint = Decimal::zero();
            if !total_asset_value.is_zero() {
                let ratio =
                    deposit.amount().checked_div(total_asset_value).unwrap();
                info!("Deposit ratio is {}", ratio);
                info!("Total shares amount is {}", self.total_share_tokens);
                amount_to_mint = amount_to_mint
                    .checked_add(
                        self.total_share_tokens.checked_mul(ratio).unwrap(),
                    )
                    .unwrap();
            } else {
                amount_to_mint = deposit.amount();
            }

            // Mint the new share tokens.

            let resource_manager = self.share_token_manager;
            let share_tokens = resource_manager.mint(amount_to_mint);
            self.total_share_tokens = self
                .total_share_tokens
                .checked_add(share_tokens.amount())
                .unwrap();

            info!(
                "Minted {} share tokens after a deposit amount of {}",
                share_tokens.amount(),
                deposit.amount()
            );

            let entry = self.user_positions.get_mut(&user_id);
            if let Some(mut user_position) = entry {
                user_position.share_amount = user_position
                    .share_amount
                    .checked_add(share_tokens.amount())
                    .unwrap();
                user_position.total_deposit = user_position
                    .total_deposit
                    .checked_add(deposit.amount())
                    .unwrap();
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

            let pool =
                self.assets.entry(XRD).or_insert_with(|| Vault::new(XRD));

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

            info!(
                "Amount of share tokens to redeem: {:?}",
                share_tokens.amount()
            );

            // Get user ID and user-specific data
            let user_id = self.get_user_id(&checked_proof);
            let (
                user_vault_equity,
                user_withdrawal_proportional_to_total_equity,
                user_withdrawal_proportional_to_his_equity,
            ) = self.calculate_user_positions(&user_id, &share_tokens);

            info!("User equity in percent: {:?}", user_vault_equity * 100);
            info!(
                "User withdrawal proportional to total equity in percent: {:?}",
                user_withdrawal_proportional_to_total_equity * 100
            );
            info!(
                "User withdrawal proportional to his equity in percent: {:?}",
                user_withdrawal_proportional_to_his_equity * 100
            );

            // Calculate the total asset value and the withdrawal value for the user
            let total_user_asset_value =
                self.calculate_total_user_asset_value(user_vault_equity);
            let _withdrawal_value = total_user_asset_value
                .checked_mul(user_withdrawal_proportional_to_his_equity)
                .unwrap();

            info!("Total user asset value: {:?}", total_user_asset_value);
            info!("Withdrawal user asset value: {:?}", _withdrawal_value);

            // Withdraw assets
            let mut withdrawn_assets = self
                .withdraw_assets(user_withdrawal_proportional_to_total_equity);

            // Calculate profit on the amount which is withdrawn and deposit traders fee if positive
            let (profit_on_withdrawal, profit_proportional_to_withdrawal) =
                self.calculate_profit_on_withdrawal(
                    &user_id,
                    total_user_asset_value,
                    user_withdrawal_proportional_to_his_equity,
                );

            info!("Profit on withdrawal: {:?}", profit_on_withdrawal);

            if profit_on_withdrawal.is_positive() {
                info!("Trader earned: {:?}", profit_on_withdrawal * dec!(0.1));
                self.substract_trader_fee(
                    &mut withdrawn_assets,
                    profit_proportional_to_withdrawal,
                );
            };

            // Update user positions
            self.update_user_positions(
                &user_id,
                &share_tokens,
                user_withdrawal_proportional_to_his_equity,
            );

            // Burn the share tokens
            self.burn_share_tokens(share_tokens);

            withdrawn_assets
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
                "This asset cannot be swapped as it is not part of the allowed pool list!"
            );

            // withdraw tokens from vault
            let from_vault = self.assets.get_mut(&from_token_address).unwrap();
            let mut from_token = from_vault.take(from_token_amount);

            // Take fidenaro fee
            let fee_rate =
                self.fidenaro.call::<(), Decimal>("get_fee_rate", &());
            let fee_amount = from_token.amount().checked_mul(fee_rate).unwrap();
            let fee = from_token.take_advanced(
                fee_amount,
                WithdrawStrategy::Rounded(RoundingMode::ToZero),
            );
            self.fidenaro.call::<(Bucket,), ()>("deposit_fee", &(fee,));

            info!("Fee amount of {} was deposited to Fidenaro.", fee_amount);

            // swap tokens
            let mut pool_adapter = self
                .fidenaro
                .call::<(ComponentAddress,), Option<PoolAdapter>>(
                    "get_pool_adapter",
                    &(pool_address,),
                )
                .unwrap();

            let (to_tokens, remaining_tokens) =
                pool_adapter.swap(pool_address, from_token);

            // deposit remaining tokens back after the swap
            self.assets
                .get_mut(&from_token_address)
                .unwrap()
                .put(remaining_tokens);

            let to_token_address = to_tokens.resource_address();
            let to_token_amount = to_tokens.amount();

            info!(
                "Amount of tokens received from swap: {:?}.",
                to_token_amount
            );

            assert!(to_token_amount > Decimal::zero(), "The amount of received tokens will be rounded to 0 if this swap is performed. Abort.");

            let pool = self
                .assets
                .entry(to_tokens.resource_address())
                .or_insert_with(|| Vault::new(to_tokens.resource_address()));

            // deposit tokens into vault
            pool.put(to_tokens);

            Runtime::emit_event(TradeEvent {
                from: from_token_address,
                from_amount: from_token_amount,
                to: to_token_address,
                to_amount: to_token_amount,
            });
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
            user_token_proof.check(
                self.fidenaro.call("get_user_token_resource_address", &()),
            )
        }

        fn validate_share_tokens(&self, share_tokens: &Bucket) {
            assert!(
                share_tokens.resource_address()
                    == self.share_token_manager.address(),
                "Wrong tokens sent. You need to send share tokens."
            );
        }

        fn validate_deposit_tokens(&self, deposit: &Bucket) {
            assert!(
                XRD == deposit.resource_address(),
                "Wrong token type sent. Only XRD can be deposited."
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
        ) -> (Decimal, Decimal, Decimal) {
            let total_user_share_token_amount =
                self.user_positions.get(user_id).unwrap().share_amount;
            let user_vault_equity_in_percent = total_user_share_token_amount
                .checked_div(self.total_share_tokens)
                .unwrap();
            let user_withdrawal_proportional_to_total_equity = share_tokens
                .amount()
                .checked_div(self.total_share_tokens)
                .unwrap();
            let user_withdrawal_proportional_to_his_equity = share_tokens
                .amount()
                .checked_div(total_user_share_token_amount)
                .unwrap();
            (
                user_vault_equity_in_percent,
                user_withdrawal_proportional_to_total_equity,
                user_withdrawal_proportional_to_his_equity,
            )
        }

        fn calculate_total_user_asset_value(
            &self,
            user_vault_equity_in_percent: Decimal,
        ) -> Decimal {
            let mut total_user_asset_value = Decimal::zero();

            if let Some(xrd_vault) = self.assets.get(&XRD) {
                total_user_asset_value = user_vault_equity_in_percent
                    .checked_mul(xrd_vault.amount())
                    .unwrap();
            }

            for (asset_address, vault) in &self.assets {
                if asset_address != &XRD {
                    // Sort the asset pair to maintain consistency in pricing
                    let (resource_x, resource_y) = if XRD < *asset_address {
                        (XRD, *asset_address)
                    } else {
                        (*asset_address, XRD)
                    };

                    // Fetch the oracle adapter and get the price using the sorted resources
                    let price = self
                        .fidenaro
                        .call::<(), Option<OracleAdapter>>(
                            "get_oracle_adapter",
                            &(),
                        )
                        .unwrap()
                        .get_price(resource_x, resource_y);

                    info!("Price: {}", price);

                    // Update total user asset value calculation
                    if let Some(equity_value) = user_vault_equity_in_percent
                        .checked_mul(vault.amount())
                        .and_then(|result| result.checked_mul(price))
                    {
                        if let Some(new_total) =
                            total_user_asset_value.checked_add(equity_value)
                        {
                            total_user_asset_value = new_total;
                        } else {
                            panic!("Overflow occurred while adding equity value to total asset value");
                        }
                    } else {
                        panic!(
                            "Overflow occurred while calculating equity value",
                        );
                    }
                }
            }

            total_user_asset_value
        }

        fn calculate_profit_on_withdrawal(
            &self,
            user_id: &String,
            total_user_asset_value: Decimal,
            user_withdrawal_proportion: Decimal,
        ) -> (Decimal, Decimal) {
            let user_position = self.user_positions.get(user_id).unwrap();
            let profit = total_user_asset_value
                .checked_sub(user_position.total_deposit)
                .unwrap();
            let profit_on_withdrawal = if profit.is_positive() {
                user_withdrawal_proportion.checked_mul(profit).unwrap()
            } else {
                dec!(0)
            };
            let profit_proportional_to_withdrawal =
                profit.checked_sub(total_user_asset_value).unwrap();

            (profit_on_withdrawal, profit_proportional_to_withdrawal)
        }

        fn withdraw_assets(
            &mut self,
            user_withdrawal_proportion: Decimal,
        ) -> Vec<Bucket> {
            let mut tokens = Vec::new();

            for vault in self.assets.values_mut() {
                // during the withdrawal we are roundind down so it can leave some dust behind
                // when the last person withdraws we use "take_all" to leave no dust behind
                if user_withdrawal_proportion.eq(&dec!(1)) {
                    info!("Withdraw all remaining assets");
                    tokens.push(vault.take_all());
                } else {
                    info!("Withdraw assets partially");
                    let amount_to_withdraw = vault
                        .amount()
                        .checked_mul(user_withdrawal_proportion)
                        .unwrap();
                    tokens.push(vault.take_advanced(
                        amount_to_withdraw,
                        WithdrawStrategy::Rounded(RoundingMode::ToZero),
                    ));
                }
            }

            tokens
        }

        fn substract_trader_fee(
            &mut self,
            assets: &mut Vec<Bucket>,
            profit_proportional_to_withdrawal: Decimal,
        ) {
            for bucket in assets {
                let amount_to_take_off = bucket
                    .amount()
                    .checked_mul(profit_proportional_to_withdrawal)
                    .unwrap()
                    .checked_mul(dec!(0.1))
                    .unwrap();
                let trader_fee = bucket.take_advanced(
                    amount_to_take_off,
                    WithdrawStrategy::Rounded(
                        RoundingMode::ToNearestMidpointToEven,
                    ),
                );
                info!(
                    "To deposit to traders fee vault: {:?}",
                    amount_to_take_off
                );
                let entry =
                    self.trader_fee_vaults.get_mut(&bucket.resource_address());
                if let Some(mut vault) = entry {
                    vault.put(trader_fee);
                } else {
                    drop(entry);
                    self.trader_fee_vaults.insert(
                        bucket.resource_address(),
                        Vault::with_bucket(trader_fee),
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
                // Safely subtract `share_tokens.amount()` from `user_position.share_amount`
                if let Some(new_share_amount) = user_position
                    .share_amount
                    .checked_sub(share_tokens.amount())
                {
                    user_position.share_amount = new_share_amount;
                } else {
                    panic!("Users withdrawn share amount is higher than his total position. Abort.");
                }

                if user_withdrawal_proportion < Decimal::zero()
                    || user_withdrawal_proportion > Decimal::one()
                {
                    panic!("Invalid withdrawal proportion. Must be between 0.0 and 1.0.");
                }

                // Calculate the new total deposit
                if let Some(new_total_deposit) =
                    user_position.total_deposit.checked_mul(
                        Decimal::one()
                            .checked_sub(user_withdrawal_proportion)
                            .unwrap(),
                    )
                {
                    user_position.total_deposit = new_total_deposit;
                } else {
                    panic!("Overflow occurred while calculating the new total deposit");
                }

                if user_position.share_amount.is_zero() {
                    remove_entry = true;
                }
            }
            if remove_entry {
                self.user_positions.remove(user_id);
            }
        }

        fn burn_share_tokens(&mut self, share_tokens: Bucket) {
            if let Some(new_total) =
                self.total_share_tokens.checked_sub(share_tokens.amount())
            {
                self.total_share_tokens = new_total;
            } else {
                panic!("Amount of share tokens to burn is higher than the total existing share tokens.")
            };
            self.share_token_manager.burn(share_tokens);
        }
    }
}
