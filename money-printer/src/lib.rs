use scrypto::prelude::*;

#[blueprint]
mod money_printer {
    struct MoneyPrinter {
        // Define what resources and data will be managed by Hello components
        sample_vault: Vault,
    }

    impl MoneyPrinter {
        // This is a function, and can be called directly on the blueprint once deployed
        pub fn instantiate() -> (Global<MoneyPrinter>, Bucket) {
            let mut my_bucket: Bucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .divisibility(DIVISIBILITY_MAXIMUM)
                .metadata(metadata! {
                    init {
                        "name" => "Fidenaro US Dollar", locked;
                        "symbol" => "FUSD", locked;
                    }
                })
                .mint_initial_supply(100000000)
                .into();

            let lp_bucket = my_bucket.take(1000000);

            let component: Global<MoneyPrinter> = Self {
                sample_vault: Vault::with_bucket(my_bucket),
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .globalize();

            (component, lp_bucket)
        }

        // This is a method, because it needs a reference to self.  Methods can only be called on components
        pub fn free_token(&mut self) -> Bucket {
            info!(
                "My balance is: {} USD. Now giving away a 1000 Fidenaro USD!",
                self.sample_vault.amount()
            );
            self.sample_vault.take(1000)
        }
    }
}
