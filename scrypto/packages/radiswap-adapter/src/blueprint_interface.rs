use scrypto::prelude::*;
use scrypto_interface::*;

define_interface! {
    Radiswap impl [
        ScryptoStub,
        ScryptoTestStub,
        #[cfg(feature = "manifest-builder-stubs")]
        ManifestBuilderStub
    ]{
        fn new(
            owner_role: OwnerRole,
            resource_address1: ResourceAddress,
            resource_address2: ResourceAddress,
        ) -> Self;
        fn add_liquidity(
            &mut self,
            resource1: Bucket,
            resource2: Bucket,
        ) -> (Bucket, Option<Bucket>);
        fn remove_liquidity(&mut self, pool_units: Bucket) -> (Bucket, Bucket);
        fn swap(&mut self, input_bucket: Bucket) -> Bucket;
        fn vault_amounts(&self) -> IndexMap<ResourceAddress, Decimal>;
    }
}
