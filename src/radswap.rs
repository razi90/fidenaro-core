use scrypto::prelude::*;

blueprint! {
    struct RadSwap {
      usdc_vault: Vault,
      btc_vault: Vault,
      btc_mint_badge: Vault,
    }

    impl RadSwap {
        pub fn new(
          usdc_resource_address: ResourceAddress,
        ) -> RadSwapComponent{
            let btc_mint_badge = ResourceBuilder::new_fungible()
            .divisibility(DIVISIBILITY_NONE)
            .metadata("name", "BTC mint badge".to_string())
            .initial_supply(1);

            let btc = ResourceBuilder::new_fungible()
            .mintable(rule!(require(btc_mint_badge.resource_address())), LOCKED)
            .burnable(rule!(require(btc_mint_badge.resource_address())), LOCKED)
            .metadata("name", "BTC".to_string())
            .initial_supply(0);

            Self{
              usdc_vault: Vault::new(usdc_resource_address),
              btc_vault: Vault::with_bucket(btc),
              btc_mint_badge: Vault::with_bucket(btc_mint_badge),
            }.instantiate()
        }

        pub fn deposit(&mut self, btc: Bucket) {
          self.btc_vault.put(btc);
        }

        pub fn swap(
            &mut self,
            tokens: Bucket,
            // _output_resource_address: ResourceAddress
        ) -> Bucket {
            info!("Swaping tokens!");
            self.usdc_vault.put(tokens);
            self.btc_vault.take(tokens.amount())
        }
    }
}
