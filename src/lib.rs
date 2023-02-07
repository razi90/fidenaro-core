use scrypto::prelude::*;

blueprint! {
  struct TradeVault {
    stable_asset_pool: Vault,
    investment_asset_pool: Vault,
    manager: ComponentAddress,
    share_mint_badge: Vault,
    share_address: ResourceAddress,
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
      }
      .instantiate()
      .globalize()
    }

    pub fn deposit(&mut self, funds: Bucket) -> Bucket {
      let address: ResourceAddress = funds.resource_address();
      assert!(address == self.stable_asset_pool.resource_address(), "Wrong token type sent");

      let cmgr: &ResourceManager = borrow_resource_manager!(self.share_address);

      // We mint a number of new votes equal to the value of
      // the deposit.
      let total = self.calc_total_funds();
      let mint_q = if total.is_zero() { funds.amount() } else { (cmgr.total_supply() / total ) * funds.amount()};

      let shares = self.share_mint_badge.authorize(|| {
          borrow_resource_manager!(self.share_address).mint(mint_q)
      });

      self.stable_asset_pool.put(funds);

      shares

    }

    // withdraw stable coin funds from the vault.
    // LP token is burned
    pub fn withdraw(&mut self, share_tokens: Bucket) -> Bucket {
      assert!(share_tokens.resource_address() == self.share_address,
      "Wrong share token type");

      let cmgr: &ResourceManager = borrow_resource_manager!(self.share_address);
      // We receive a number of tokens proportional to our
      // ownership in the share tokens.
      //
      // Note that if free_funds does not have sufficient tokens
      // then this call fails and the user needs to wait for
      // free_funds to refill, possibly making a smaller
      // withdrawal in the meantime.
      let bucket_out = self.stable_asset_pool.take(self.value_of(share_tokens.amount(), cmgr));
      self.share_mint_badge.authorize(||  {
        share_tokens.burn();
      });

      bucket_out
    }

    // swap a specific amount from a tocken to another
    // take token from the input token vault and swap it into the output token
    // store the output token in a vault
    pub fn swap(
      &mut self,
      input_token_address: ResourceAddress,
      output_token_address: ResourceAddress,
      input_amount: Decimal
    ) {
      // interact with a DEX here
    }

    /// Calculates the total funds in the stable asset pool
    fn calc_total_funds(&self) -> Decimal {
      let total: Decimal = self.stable_asset_pool.amount();
      total
    }

    /// Calculates the value of a given number of share tokens.
    fn value_of(&self, amount: Decimal, manager: &ResourceManager) -> Decimal {
      let total = manager.total_supply();
      if total.is_zero() { return amount; }
      else { return amount * (self.calc_total_funds() / total); }
    }
  }
}
