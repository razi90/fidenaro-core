use scrypto::prelude::*;

blueprint! {
    struct Hello {
        // Define what resources and data will be managed by Hello components
        sample_vault: Vault
    }

    impl Hello {
        // Implement the functions and methods which will manage those resources and data

        // This is a function, and can be called directly on the blueprint once deployed
        pub fn instantiate_hello() -> ComponentAddress {
            // Create a new token called "HelloToken," with a fixed supply of 1000, and put that supply into a bucket
            let my_bucket: Bucket = ResourceBuilder::new_fungible()
                .metadata("name", "HelloToken")
                .metadata("symbol", "HT")
                .initial_supply(1000);

            // Instantiate a Hello component, populating its vault with our supply of 1000 HelloToken
            Self {
                sample_vault: Vault::with_bucket(my_bucket)
            }
            .instantiate()
            .globalize()
        }

        // This is a method, because it needs a reference to self.  Methods can only be called on components
        pub fn free_token(&mut self) -> Bucket {
            info!("My balance is: {} HelloToken. Now giving away a token!", self.sample_vault.amount());
            // If the semi-colon is omitted on the last line, the last value seen is automatically returned
            // In this case, a bucket containing 1 HelloToken is returned
            self.sample_vault.take(1)
        }

        // deposit stable coin funds into the vault
        // recieve LP token
        pub fn deposit(&mut self, Bucket funds) -> Bucket {
          self.sample_vault.take(1)
        }

        // withdraw stable coin funds from the vault.
        // LP token is burned
        pub fn withdraw(&mut self, Bucket lp) -> Bucket {
          self.sample_vault.take(1)
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

        // buy a call option for a specific token from an options protocol
        pub fn buy_call_option(&mut self) {
        }

        // buy a put option for a specific token from an options protocol
        pub fn buy_put_option(&mut self) {
        }

    }
}