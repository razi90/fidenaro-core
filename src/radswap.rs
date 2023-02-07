use scrypto::prelude::*;

blueprint! {
    struct RadSwap {}

    impl RadSwap {
        pub fn new() -> RadSwapComponent{
            Self{}.instantiate()
        }

        pub fn swap(&self) {
            info!("Swaping tokens!");
        }
    }
}
