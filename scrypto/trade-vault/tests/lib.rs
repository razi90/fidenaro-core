use scrypto::*;
use scrypto_test::prelude::*;
use trade_vault::test_bindings::*;

#[test]
fn test_init_fidenaro() -> Result<(), RuntimeError> {
    // Arrange
    let mut env = TestEnvironment::new();
    let package_address = Package::compile_and_publish(this_package!(), &mut env)?;

    Ok(())
}
