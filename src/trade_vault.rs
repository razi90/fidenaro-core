use crate::fidenaro_treasury::*;
use crate::radswap::*;
use scrypto::prelude::*;

#[scrypto(TypeId, Encode, Decode, NonFungibleData, Describe)]
struct Trade {
    input_token_address: ResourceAddress,
    // output_token_address: ResourceAddress,
    input_amount: Decimal,
    output_amount: Decimal,
    opening_price: Decimal,
    closing_price: Decimal,
}

impl Trade {
    pub fn calculate_performance_fee(&self, performance_fee: Decimal) -> Decimal {
        let profit =
            (self.output_amount * self.closing_price) - (self.input_amount * self.opening_price);
        if profit > Decimal::zero() {
            return profit * performance_fee;
        } else {
            return Decimal::zero();
        }
    }
}

blueprint! {
    struct TradeVault {
      stable_asset_pool: Vault,
      investment_asset_pool: Vault,
      manager: ComponentAddress,
      share_mint_badge: Vault,
      share_address: ResourceAddress,
      shares: Vault,
      radswap: RadSwapComponent,
      fidenaro_treasury: FidenaroTreasuryComponent,
      performance_fee: Decimal,
      fidenaro_fee: Decimal,
      trades: Vec<Trade>,
    }

    impl TradeVault {
        pub fn init_trade_vault(
            stable_asset_address: ResourceAddress,
            investment_asset_address: ResourceAddress,
            manager_wallet_address: ComponentAddress,
            performance_fee: Decimal,
        ) -> ComponentAddress {
            // This is kept in a bucket in self, for automatic minting
            // and burning of share tokens.
            let share_mint_badge = ResourceBuilder::new_fungible()
                .divisibility(DIVISIBILITY_NONE)
                .metadata("name", "Shares mint badge".to_string())
                .initial_supply(1);

            // These token represent one's share on the capital locked into the vault
            let shares = ResourceBuilder::new_fungible()
                .mintable(rule!(require(share_mint_badge.resource_address())), LOCKED)
                .burnable(rule!(require(share_mint_badge.resource_address())), LOCKED)
                .metadata("name", "Trading fund share tokens".to_string())
                .initial_supply(0);

            let fidenaro_fee = Decimal::from("0.05");

            let trade_vec: Vec<Trade> = Vec::new();

            Self {
                stable_asset_pool: Vault::new(stable_asset_address),
                investment_asset_pool: Vault::new(investment_asset_address),
                manager: manager_wallet_address,
                share_mint_badge: Vault::with_bucket(share_mint_badge),
                share_address: shares.resource_address(),
                shares: Vault::with_bucket(shares),
                radswap: RadSwapComponent::new(),
                fidenaro_treasury: FidenaroTreasuryComponent::new(),
                performance_fee: performance_fee,
                fidenaro_fee: fidenaro_fee,
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
                address == self.stable_asset_pool.resource_address(),
                "Wrong token type sent"
            );

            // Mint the new share tokens.
            let shares = self
                .share_mint_badge
                .authorize(|| borrow_resource_manager!(self.share_address).mint(deposit.amount()));

            // Store the deposited stable coins in the stable asset pool.
            self.stable_asset_pool.put(deposit);

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
            let bucket_out = self.stable_asset_pool.take(share_token_amount);

            // Burn the share tokens being withdrawn
            self.share_mint_badge.authorize(|| {
                share_tokens.burn();
            });

            // Return the withdrawn stable coins
            bucket_out
        }

        pub fn open_trade(
            &mut self,
            input_token_address: ResourceAddress,
            output_token_address: ResourceAddress,
            input_amount: Decimal,
        ) {
            let funds = self.stable_asset_pool.take(input_amount);
            let output_funds = self.radswap.swap(funds, output_token_address);

            let output_amount = output_funds.amount();
            let opening_price = input_amount / output_amount;

            self.investment_asset_pool.put(output_funds);
            self.trades.push(Trade {
              input_token_address,
            //   output_token_address,
              input_amount,
              output_amount,
              opening_price,
              closing_price: Decimal::from("0.0"),
            });
        }

        pub fn close_trade(
            &mut self,
            trade_index: usize,
        ) -> Bucket {
            let trade = &mut self.trades[trade_index];
            let output_funds = self.investment_asset_pool.take(trade.output_amount);
            let mut input_funds = self.radswap.swap(output_funds, trade.input_token_address);

            let closing_price = input_funds.amount() / trade.output_amount;

            trade.closing_price = closing_price;

            let absolut_performance_fee = trade.calculate_performance_fee(self.performance_fee);
            let absolut_fidenaro_fee = self.calc_fidenaro_fee(absolut_performance_fee);

            let absolut_trader_performance_fee = absolut_performance_fee - absolut_fidenaro_fee;

            let trader_share_bucket = input_funds.take(absolut_trader_performance_fee);

            let fidenaro_share_bucket = input_funds.take(absolut_fidenaro_fee);

            // send fidenaro fee to the treasury
            self.fidenaro_treasury.deposit(fidenaro_share_bucket);

            self.stable_asset_pool.put(input_funds);
            trader_share_bucket
        }

        fn calc_fidenaro_fee(&self, profit: Decimal) -> Decimal {
            let absolut_fidenaro_fee = profit * self.fidenaro_fee;
            absolut_fidenaro_fee
        }

        /// Calculates the total funds in the stable asset pool
        fn _calc_total_funds(&self) -> Decimal {
            let total: Decimal = self.stable_asset_pool.amount();
            total
        }
    }
}
