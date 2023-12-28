use fidenaro::test_bindings::*;
use scrypto::*;
use scrypto_test::prelude::*;

#[test]
fn test_init_fidenaro() -> Result<(), RuntimeError> {
    // Arrange
    let mut env = TestEnvironment::new();
    let package_address = Package::compile_and_publish(this_package!(), &mut env)?;

    Ok(())
}
