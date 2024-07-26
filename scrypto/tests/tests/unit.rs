use tests::prelude::*;

#[test]
fn simple_testing_environment_can_be_created() {
    ScryptoUnitTestEnv::new().expect("Must succeed!");
}

#[test]
fn can_deposit_xrd_into_vault_and_receive_shares() -> Result<(), RuntimeError> {
    // Arrange
    let Environment {
        environment: ref mut env,
        mut protocol,
        ..
    } = ScryptoUnitTestEnv::new()?;

    // Act

    // Assert

    Ok(())
}
