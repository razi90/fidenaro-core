use fidenaro::fidenaro_test::Fidenaro;
use scrypto_test::prelude::*;
use user_factory::user_factory_test::UserFactory;

fn setup_test_environment(
) -> Result<(TestEnvironment<InMemorySubstateDatabase>, Fidenaro), RuntimeError> {
    let mut env = TestEnvironment::new();
    env.disable_auth_module();

    let fidenaro_package_address =
        PackageFactory::compile_and_publish(this_package!(), &mut env, CompileProfile::Fast)?;

    let (fidenaro, _) = Fidenaro::instantiate(OwnerRole::None, fidenaro_package_address, &mut env)?;

    Ok((env, fidenaro))
}

#[test]
fn test_set_user_token_resouce_address() -> Result<(), RuntimeError> {
    // Arrange
    let (mut env, mut fidenaro) = setup_test_environment()?;

    let user_factory_package_address =
        PackageFactory::compile_and_publish("../user-factory", &mut env, CompileProfile::Fast)?;

    let user_factory = UserFactory::instantiate(user_factory_package_address, &mut env)?;
    let user_token_resource_address = user_factory.get_user_token_resource_address(&mut env)?;

    // Act
    fidenaro.set_user_token_resource_address(user_token_resource_address, &mut env)?;

    let fidenaro_user_token_resource_address =
        fidenaro.get_user_token_resource_address(&mut env)?;

    // Assert
    assert_eq!(
        user_token_resource_address, fidenaro_user_token_resource_address,
        "User token resource address is not correct."
    );

    Ok(())
}
