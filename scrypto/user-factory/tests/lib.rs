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
    let package_address =
        PackageFactory::compile_and_publish(this_package!(), &mut env, CompileProfile::Fast)?;

    let mut user_factory = UserFactory::instantiate(package_address, &mut env)?;

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
fn test_update_user_data() -> Result<(), RuntimeError> {
    // Arrange
    let (mut env, mut user_factory, user_token) = setup_test_environment()?;

    let mut update_data: HashMap<String, String> = HashMap::new();
    update_data.insert(String::from("user_name"), String::from("TradingDraziw"));
    update_data.insert(
        String::from("pfp_url"),
        String::from(
            "https://pbs.twimg.com/profile_images/1768938778956103680/mPz6mOzD_400x400.jpg",
        ),
    );

    // Act and Assert
    assert!(user_factory
        .update_user_data(user_token, update_data, &mut env)
        .is_ok());

    Ok(())
}

#[test]
fn test_update_user_data_wrong_field() -> Result<(), RuntimeError> {
    // Arrange
    let (mut env, mut user_factory, user_token) = setup_test_environment()?;

    let mut update_data: HashMap<String, String> = HashMap::new();
    update_data.insert(String::from("wrong_field"), String::from("TradingDraziw"));

    // Act and Assert
    assert!(user_factory
        .update_user_data(user_token, update_data, &mut env)
        .is_err());

    Ok(())
}

// #[test]
// fn test_get_user_token_address() -> Result<(), RuntimeError> {
//     // Arrange
//     let (mut env, user_factory, _) = setup_test_environment()?;

//     // Act
//     let user_token_resource_address: ResourceAddress =
//         user_factory.get_user_token_resource_address(&mut env)?;

//     let user_token_resource_manager = match env.with_component_state(
//         user_factory,
//         |user_token_manager: &mut ResourceManager, _| {
//             println!("Substate accessed: {:?}", user_token_manager); // Debug print
//             user_token_manager.clone()
//         },
//     ) {
//         Ok(manager) => manager,
//         Err(e) => {
//             panic!("Failed to get user token manager: {:?}", e);
//         }
//     };

//     // Assert
//     assert_eq!(
//         user_token_resource_address,
//         user_token_resource_manager.0
//     , "Check that the user token address getter returns the same address as the corresponding resource manager.");

//     Ok(())
// }
