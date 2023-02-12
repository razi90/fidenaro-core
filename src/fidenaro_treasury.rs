use scrypto::prelude::*;

blueprint! {
    struct FidenaroTreasury {
      treasury: HashMap<ResourceAddress, Vault>,
    }

    impl FidenaroTreasury {
        pub fn new() -> FidenaroTreasuryComponent{
            let treasury: HashMap<ResourceAddress, Vault> = HashMap::new();
            Self{
              treasury: treasury,
            }.instantiate()
        }

        pub fn deposit(&mut self, tokens: Bucket) {
            info!("Received tokens!");
            let token_address: ResourceAddress = tokens.resource_address();
            let optional_vault: Option<&mut Vault> = self.treasury.get_mut(&token_address);
            match optional_vault {
                Some (vault) => {
                    // If it matches it means that the vault with this resource addreas already exists.
                    vault.put(tokens);
                }
                None => {
                    // Create a new vault in the treasury to hold this tokens
                    let new_vault = Vault::with_bucket(tokens);
                    self.treasury.insert(token_address, new_vault);
                }
            }
        }
    }
}
