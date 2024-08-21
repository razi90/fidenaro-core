use scrypto::prelude::*;

#[blueprint]
mod trade_engine {
    struct TradeEngine {
        // Define what resources and data will be managed by Hello components
        assets: KeyValueStore<ResourceAddress, Vault>,
    }

    impl TradeEngine {
        pub fn instantiate() -> Global<TradeEngine> {
            Self {
                assets: KeyValueStore::new(),
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .globalize()
        }

        pub fn deposit_resource(&mut self, bucket: Bucket) {
            self.assets
                .insert(bucket.resource_address(), Vault::with_bucket(bucket));
        }

        pub fn open_position(
            &mut self,
            from_token: Bucket,
            to_token_address: ResourceAddress,
            to_token_amount: Decimal,
        ) -> Bucket {
            self.assets
                .get_mut(&from_token.resource_address())
                .unwrap()
                .put(from_token);
            self.assets
                .get_mut(&to_token_address)
                .unwrap()
                .take(to_token_amount)
        }
    }
}
