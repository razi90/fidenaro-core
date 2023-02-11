use scrypto::prelude::*;

blueprint! {
    struct RadSwap {}

    impl RadSwap {
        pub fn new() -> RadSwapComponent{
            Self{}.instantiate()
        }

        pub fn swap(
            &mut self,
            tokens: Bucket,
            output_resource_address: ResourceAddress
        ) -> Bucket {
            info!("Swaping tokens!");
            tokens
        }
    }
}
