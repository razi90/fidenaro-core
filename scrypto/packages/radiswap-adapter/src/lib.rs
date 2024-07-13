mod blueprint_interface;

macro_rules! pool {
    ($address: expr) => {
        $crate::blueprint_interface::OciswapV1PoolInterfaceScryptoStub::from($address)
    };
}

pub mod adapter {}
