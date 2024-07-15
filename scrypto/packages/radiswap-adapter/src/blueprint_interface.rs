use scrypto::prelude::*;
use scrypto_interface::*;

define_interface! {
    RadiswapPool impl [
        ScryptoStub,
        ScryptoTestStub,
        #[cfg(feature = "manifest-builder-stubs")]
        ManifestBuilderStub
    ] {
        fn new(
            owner_role: OwnerRole,
            resource_address1: ResourceAddress,
            resource_address2: ResourceAddress,
        ) -> Self;
        fn add_liquidity(
            &mut self,
            #[manifest_type = "ManifestBucket"]
            resource1: Bucket,
            #[manifest_type = "ManifestBucket"]
            resource2: Bucket,
        ) -> (Bucket, Option<Bucket>);
        fn remove_liquidity(
            &mut self,
            #[manifest_type = "ManifestBucket"]
            pool_units: Bucket
        )-> (Bucket, Bucket);
        fn swap(
            &mut self,
            #[manifest_type = "ManifestBucket"]
            input_bucket: Bucket
        ) -> Bucket;
        fn vault_amounts(&self) -> IndexMap<ResourceAddress, Decimal>;
    }
}
