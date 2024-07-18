mod blueprint_interface;

pub use crate::blueprint_interface::*;

use common::prelude::*;
use ports_interface::prelude::*;
use scrypto::prelude::*;
use scrypto_interface::*;

macro_rules! define_error {
    (
        $(
            $name: ident => $item: expr;
        )*
    ) => {
        $(
            pub const $name: &'static str = concat!("[Radiswap Adapter]", " ", $item);
        )*
    };
}

define_error! {
    FAILED_TO_GET_RESOURCE_ADDRESSES_ERROR
        => "Failed to get resource addresses - unexpected error.";
    FAILED_TO_GET_VAULT_ERROR
        => "Failed to get vault - unexpected error.";
    PRICE_IS_UNDEFINED
        => "Price is undefined.";
}

macro_rules! pool {
    ($address: expr) => {
        $crate::blueprint_interface::RadiswapInterfaceScryptoStub::from($address)
    };
}

#[blueprint_with_traits]
pub mod adapter {

    struct RadiswapAdapter;

    impl RadiswapAdapter {
        pub fn instantiate(
            _: AccessRule,
            _: AccessRule,
            metadata_init: MetadataInit,
            owner_role: OwnerRole,
            address_reservation: Option<GlobalAddressReservation>,
        ) -> Global<RadiswapAdapter> {
            let address_reservation = address_reservation.unwrap_or_else(|| {
                Runtime::allocate_component_address(BlueprintId {
                    package_address: Runtime::package_address(),
                    blueprint_name: Runtime::blueprint_name(),
                })
                .0
            });

            Self {}
                .instantiate()
                .prepare_to_globalize(owner_role)
                .metadata(ModuleConfig {
                    init: metadata_init,
                    roles: Default::default(),
                })
                .with_address(address_reservation)
                .globalize()
        }
    }

    impl PoolAdapterInterfaceTrait for RadiswapAdapter {
        fn swap(&mut self, pool_address: ComponentAddress, input_bucket: Bucket) -> Bucket {
            let mut pool = pool!(pool_address);
            pool.swap(input_bucket)
        }

        fn price(&mut self, pool_address: ComponentAddress) -> Price {
            let pool = pool!(pool_address);
            let vault_amounts = pool.vault_amounts();

            let (resource_address1, resource_address2) = self.resource_addresses(pool_address);
            let amount1 = *vault_amounts
                .get(&resource_address1)
                .expect(FAILED_TO_GET_VAULT_ERROR);
            let amount2 = *vault_amounts
                .get(&resource_address2)
                .expect(FAILED_TO_GET_VAULT_ERROR);

            Price {
                base: resource_address1,
                quote: resource_address2,
                price: amount2.checked_div(amount1).expect(PRICE_IS_UNDEFINED),
            }
        }

        fn resource_addresses(
            &mut self,
            pool_address: ComponentAddress,
        ) -> (ResourceAddress, ResourceAddress) {
            let pool = pool!(pool_address);
            let mut keys = pool.vault_amounts().into_keys();

            let resource_address1 = keys.next().expect(FAILED_TO_GET_RESOURCE_ADDRESSES_ERROR);
            let resource_address2 = keys.next().expect(FAILED_TO_GET_RESOURCE_ADDRESSES_ERROR);

            (resource_address1, resource_address2)
        }
    }
}
