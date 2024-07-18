use scrypto::math::Decimal;
use scrypto_test::prelude::*;

use tests::prelude::*;

#[test]
fn simple_testing_environment_can_be_created() {
    let env = ScryptoUnitEnv::new();
}

#[test]
fn simple_radiswap_test() -> Result<(), RuntimeError> {
    // Arrange
    let mut ledger = LedgerSimulatorBuilder::new().build();
    let package_address = ledger.compile_and_publish("../bootstrapping-helper/radiswap");
    let (public_key, _private_key, account) = ledger.new_allocated_account();

    let resource_address1 = ledger.create_fungible_resource(Decimal::from(100), 18, account);
    let resource_address2 = ledger.create_fungible_resource(Decimal::from(100), 18, account);

    // let mut radiswap = Radiswap::new(
    //     OwnerRole::None,
    //     resource_address1,
    //     resource_address2,
    //     package_address,
    // )?;

    Ok(())
}
