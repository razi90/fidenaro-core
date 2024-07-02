use scrypto_test::prelude::*;
use user_factory::user_factory_test::UserFactory;

fn setup_test_environment() -> Result<
    (
        TestEnvironment<InMemorySubstateDatabase>,
        UserFactory,
        NonFungibleBucket,
    ),
    RuntimeError,
> {
    let mut env = TestEnvironment::new();
    let user_factory_package_address =
        PackageFactory::compile_and_publish("../user-factory", &mut env, CompileProfile::Fast)?;

    let mut user_factory = UserFactory::instantiate(user_factory_package_address, &mut env)?;

    let user_token = user_factory.create_new_user(
        "BearosSnap".to_string(),
        "Leverage Trader".to_string(),
        "https://pbs.twimg.com/profile_images/1768938778956103680/mPz6mOzD_400x400.jpg".to_string(),
        "XBearosSnap".to_string(),
        "TBearosSnap".to_string(),
        "DBearosSnap".to_string(),
        &mut env,
    )?;

    Ok((env, user_factory, user_token))
}

#[test]
fn test_init_fidenaro() -> Result<(), RuntimeError> {
    // Arrange
    let mut env = TestEnvironment::new();
    _ = setup_test_environment();
    // let package_address = Package::compile_and_publish(this_package!(), &mut env)?;

    Ok(())
}
