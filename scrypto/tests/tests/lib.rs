use scrypto_test::prelude::*;

use tests::prelude::*;

#[test]
fn simple_testing_environment_can_be_created() {
    let env = ScryptoUnitEnv::new();
}

// #[test]
// fn simple_radiswap_test() -> Result<(), RuntimeError> {
//     // Arrange
//     let mut ledger = LedgerSimulatorBuilder::new().build();
//     let package_address = ledger.compile_and_publish("../bootstrapping-helper/radiswap");
//     let (public_key, _private_key, account) = ledger.new_allocated_account();

//     let resource_address1 =
//         ledger.create_freely_mintable_fungible_resource(OwnerRole::None, None, 18, account);

//     let manifest = ManifestBuilder::new()
//         .lock_fee_from_faucet()
//         .mint_fungible(XRD, dec!(100_000_000))
//         .mint_fungible(resource_address1, dec!(100_000_000))
//         .try_deposit_entire_worktop_or_abort(account, None)
//         .build();
//     ledger
//         .execute_manifest_without_auth(manifest)
//         .expect_commit_success();

//     Ok(())
// }
