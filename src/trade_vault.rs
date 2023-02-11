use crate::radswap::*;
use scrypto::prelude::*;

blueprint! {
  struct TradeVault {
    stable_asset_pool: Vault,
    investment_asset_pool: Vault,
    manager: ComponentAddress,
    share_mint_badge: Vault,
    share_address: ResourceAddress,
    radswap: RadSwapComponent,
  }

  impl TradeVault {

    pub fn init_trade_vault(
      stable_asset_address: ResourceAddress,
      investment_asset_address: ResourceAddress,
      manager_wallet_address: ComponentAddress
    ) -> ComponentAddress {
      // This is kept in a bucket in self, for automatic minting
      // and burning of vote tokens.
      let share_mint_badge = ResourceBuilder::new_fungible()
        .divisibility(DIVISIBILITY_NONE)
        .metadata("name", "Shares mint badge".to_string())
        .initial_supply(1);

      // These token represent one's right to vote into the DAO
      let shares = ResourceBuilder::new_fungible()
        .mintable(rule!(require(share_mint_badge.resource_address())), LOCKED)
        .burnable(rule!(require(share_mint_badge.resource_address())), LOCKED)
        .metadata("name", "Trading fund share tokens".to_string())
        .initial_supply(0);

      Self {
        stable_asset_pool: Vault::new(stable_asset_address),
        investment_asset_pool: Vault::new(investment_asset_address),
        manager: manager_wallet_address,
        share_mint_badge: Vault::with_bucket(share_mint_badge),
        share_address: shares.resource_address(),
        radswap: RadSwapComponent::new(),
      }
      .instantiate()
      .globalize()
    }


    /// Deposits a specified amount of stable coins into the vault.
    ///
    /// # Arguments
    ///
    /// * `deposit` - The stable coins to be deposited.
    ///
    /// # Returns
    ///
    /// A `Bucket` of newly minted share tokens, proportional in value to the amount of stable coins deposited.
    ///
    /// # Errors
    ///
    /// If the wrong type of stable coin is passed in, the function will fail with an error message.
    pub fn deposit(&mut self, deposit: Bucket) -> Bucket {
      let address: ResourceAddress = deposit.resource_address();
      // Ensure that the type of stable coin passed in matches the type stored in the stable asset pool.
      assert!(address == self.stable_asset_pool.resource_address(), "Wrong token type sent");

      // Borrow the resource manager for the share tokens.
      let share_cmgr: &ResourceManager = borrow_resource_manager!(self.share_address);

      // Calculate the current total number of share tokens.
      let total_tokens = share_cmgr.total_supply();

      // Calculate the total value of the stable asset pool.
      let total_funds = self.calc_total_funds();

      // Calculate the number of new share tokens to mint, proportional to the total number of existing share tokens.
      let mint_quantity = deposit.amount() * total_tokens / (total_funds + deposit.amount());

      // Mint the new share tokens.
      let shares = self.share_mint_badge.authorize(|| {
          borrow_resource_manager!(self.share_address).mint(mint_quantity)
      });

      // Store the deposited stable coins in the stable asset pool.
      self.stable_asset_pool.put(deposit);

      shares

    }

    /// Withdraws a specified number of share tokens and returns an equivalent value of stable coins.
    ///
    /// # Arguments
    ///
    /// * `share_tokens` - The share tokens to be withdrawn.
    ///
    /// # Returns
    ///
    /// A `Bucket` of stable coins, equivalent in value to the number of share tokens withdrawn.
    ///
    /// # Errors
    ///
    /// If the wrong type of share token is passed in, the function will fail with an error message.
    pub fn withdraw(&mut self, share_tokens: Bucket) -> Bucket {
      // Ensure that the correct type of share token is being withdrawn
      assert!(share_tokens.resource_address() == self.share_address, "Wrong share token type");

      // Get a reference to the share token's resource manager
      let share_cmgr: &ResourceManager = borrow_resource_manager!(self.share_address);

      // Get the number of share tokens being withdrawn
      let share_token_amount = share_tokens.amount();

      // Get the total number of share tokens in circulation
      let total_tokens = share_cmgr.total_supply();

      // Get the current total value of the stable asset pool
      let total_funds = self.calc_total_funds();

      // Calculate the amount of stable coins that should be withdrawn,
      // proportional to the number of share tokens being withdrawn
      let withdraw_amount = share_token_amount * total_funds / total_tokens;

      // Take the calculated amount of stable coins from the pool
      let bucket_out = self.stable_asset_pool.take(withdraw_amount);

      // Burn the share tokens being withdrawn
      self.share_mint_badge.authorize(||  {
          share_tokens.burn();
      });

      // Return the withdrawn stable coins
      bucket_out
    }

    // swap a specific amount from a tocken to another
    // take token from the input token vault and swap it into the output token
    // store the output token in a vault
    // pub fn swap(
    //   &mut self,
    //   input_token_address: ResourceAddress,
    //   output_token_address: ResourceAddress,
    //   input_amount: Decimal
    // ) {
    //   // interact with a DEX here
    // }

    /// Calculates the total funds in the stable asset pool
    fn calc_total_funds(&self) -> Decimal {
      let total: Decimal = self.stable_asset_pool.amount();
      total
    }
  }
}
