use crate::fidenaro_treasury::*;
use scrypto::prelude::*;

// Define the methods on instantiated components
external_component! {
    RadiswapComponentTarget {
        fn add_liquidity(&mut self, a_tokens: Bucket, b_tokens: Bucket) -> (Bucket, Bucket);
        fn remove_liquidity(&mut self, lp_tokens: Bucket) -> (Bucket, Bucket);
        fn swap(&mut self, input_tokens: Bucket) -> Bucket;
        fn get_pair(&self) -> (ResourceAddress, ResourceAddress);
    }
}

#[derive(ScryptoCategorize, ScryptoEncode, ScryptoDecode, LegacyDescribe)]
enum TradeStatus {
    Open,
    Closed,
}

#[derive(ScryptoCategorize, ScryptoEncode, ScryptoDecode, NonFungibleData, LegacyDescribe)]
struct Trade {
    stable_coin_amount: Decimal,
    bought_asset_amount: Decimal,
    status: TradeStatus,
    profit: Decimal,
}

impl Trade {}

#[blueprint]
mod trade_vault {
    struct TradeVault {
        manager: ComponentAddress,
        radswap: RadiswapComponentTarget,
        stable_coin_address: ResourceAddress,
        investment_asset_address: ResourceAddress,
        stable_coin_pool: Vault,
        investment_asset_pool: Vault,
        share_mint_badge: Vault,
        share_address: ResourceAddress,
        performance_fee: Decimal,
        fidenaro_treasury: FidenaroTreasuryComponent,
        fidenaro_fee: Decimal,
        trades: Vec<Trade>,
    }

    impl TradeVault {
        pub fn init_trade_vault(
            manager_wallet_address: ComponentAddress,
            performance_fee: Decimal,
            swap_pool_component_address: ComponentAddress,
        ) -> ComponentAddress {
            // This is kept in a bucket in self, for automatic minting
            // and burning of share tokens.
            let share_mint_badge = ResourceBuilder::new_fungible()
                .divisibility(DIVISIBILITY_NONE)
                .metadata("name", "Shares mint badge".to_string())
                .mint_initial_supply(1);

            // These token represent one's share on the capital locked into the vault
            let share_address = ResourceBuilder::new_fungible()
                .mintable(rule!(require(share_mint_badge.resource_address())), LOCKED)
                .burnable(rule!(require(share_mint_badge.resource_address())), LOCKED)
                .metadata("name", "Trading fund share tokens".to_string())
                .create_with_no_initial_supply();

            let fidenaro_fee = Decimal::from("0.05");

            let trade_vec: Vec<Trade> = Vec::new();

            let radswap = RadiswapComponentTarget::at(swap_pool_component_address);
            // get resource addresses from the swap pool
            let (stable_coin_address, investment_asset_address) = radswap.get_pair();

            Self {
                manager: manager_wallet_address,
                radswap,
                stable_coin_address,
                investment_asset_address,
                stable_coin_pool: Vault::new(stable_coin_address),
                investment_asset_pool: Vault::new(investment_asset_address),
                share_mint_badge: Vault::with_bucket(share_mint_badge),
                share_address,
                performance_fee,
                fidenaro_treasury: FidenaroTreasuryComponent::new(),
                fidenaro_fee,
                trades: trade_vec,
            }
            .instantiate()
            .globalize()
        }

        /**
        Deposits a specified amount of stable coins into the vault.

        # Arguments

        * `deposit` - The stable coins to be deposited.

        # Returns

        A `Bucket` of newly minted share tokens, proportional in value to the amount of stable coins deposited.

        # Errors

        If the wrong type of stable coin is passed in, the function will fail with an error message.
        */
        pub fn deposit(&mut self, deposit: Bucket) -> Bucket {
            let address: ResourceAddress = deposit.resource_address();
            // Ensure that the type of stable coin passed in matches the type stored in the stable asset pool.
            assert!(
                address == self.stable_coin_pool.resource_address(),
                "Wrong token type sent"
            );

            // Mint the new share tokens.
            let shares = self
                .share_mint_badge
                .authorize(|| borrow_resource_manager!(self.share_address).mint(deposit.amount()));

            // Store the deposited stable coins in the stable asset pool.
            self.stable_coin_pool.put(deposit);

            shares
        }

        /**
        Withdraws a specified number of share tokens and returns an equivalent value of stable coins.

        # Arguments

        * `share_tokens` - The share tokens to be withdrawn.

        # Returns

        A `Bucket` of stable coins, equivalent in value to the number of share tokens withdrawn.

        # Errors

        If the wrong type of share token is passed in, the function will fail with an error message.
        */
        pub fn withdraw(&mut self, share_tokens: Bucket) -> Bucket {
            // Ensure that the correct type of share token is being withdrawn
            assert!(
                share_tokens.resource_address() == self.share_address,
                "Wrong share token type"
            );

            // Get the number of share tokens being withdrawn
            let share_token_amount = share_tokens.amount();

            // Take the calculated amount of stable coins from the pool
            let bucket_out = self.stable_coin_pool.take(share_token_amount);

            // Burn the share tokens being withdrawn
            self.share_mint_badge.authorize(|| {
                share_tokens.burn();
            });

            // Return the withdrawn stable coins
            bucket_out
        }

        pub fn open_trade(&mut self, input_amount: Decimal) {
            // get funds from the stable asset pool in the specified amount
            let input_funds = self.stable_coin_pool.take(input_amount);

            // perform swap from stable coin to the target asset
            let output_funds = self.radswap.swap(input_funds);

            // calculate the price at which the trade was performed
            let output_amount = output_funds.amount();
            // let opening_price = input_amount / output_amount;

            // put bought assets into the investment pool
            self.investment_asset_pool.put(output_funds);

            // safe the trade meta data
            self.trades.push(Trade {
                stable_coin_amount: input_amount,
                bought_asset_amount: output_amount,
                status: TradeStatus::Open,
                profit: Decimal::zero(),
            });

            let price = input_amount / output_amount;

            info!("Bought BTC for the avg price of {} USD", price);
        }

        pub fn close_trade(&mut self, trade_index: u32) -> Bucket {
            // get trade with the specified index
            let trade = &mut self.trades[trade_index.to_usize().unwrap()];
            let asset = self.investment_asset_pool.take(trade.bought_asset_amount);

            // swap assets from the trade back to stable coins
            let mut output_stable_coins = self.radswap.swap(asset);
            let absolute_output_amount = output_stable_coins.amount();

            info!(
                "Sold BTC for the avg price of {} USD",
                absolute_output_amount / trade.bought_asset_amount
            );

            // calculate profit
            let profit = absolute_output_amount - trade.stable_coin_amount;

            info!("Make {} of profit.", profit);

            // calculate absolute performance fees
            let absolute_performance_fee = if profit > Decimal::zero() {
                profit * self.performance_fee
            } else {
                Decimal::zero()
            };

            // take fidenaro fees
            let absolute_fidenaro_fee = absolute_performance_fee * self.fidenaro_fee;
            let fidenaro_share_bucket = output_stable_coins.take(absolute_fidenaro_fee);
            info!("{} of profit goes to fidenaro.", absolute_fidenaro_fee);

            // send fidenaro fee to the treasury
            self.fidenaro_treasury.deposit(fidenaro_share_bucket);

            // take trader fees
            let absolute_trader_fee = absolute_performance_fee - absolute_fidenaro_fee;
            let trader_share_bucket = output_stable_coins.take(absolute_trader_fee);
            info!("{} of profit goes to the trader.", absolute_trader_fee);

            // send rest of stable coins back to the vault
            self.stable_coin_pool.put(output_stable_coins);

            // close the trade
            trade.status = TradeStatus::Closed;
            trade.profit = profit;

            // give trader the bucket with his performance fee
            trader_share_bucket
        }
    }
}
