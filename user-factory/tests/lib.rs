use radix_engine_interface::prelude::*;
use scrypto::this_package;
use scrypto_test::prelude::*;
use scrypto_unit::*;

use user_factory::test_bindings::*;

// #[test]
// fn test_user_factory() {
//     // Setup the environment
//     let mut test_runner = TestRunnerBuilder::new().build();

//     // Create an account
//     let (public_key, _private_key, account) = test_runner.new_allocated_account();

//     // Publish package
//     let package_address = test_runner.compile_and_publish(this_package!());

//     // Test the `instantiate` function.
//     let manifest = ManifestBuilder::new()
//         .call_function(
//             package_address,
//             "UserFactory",
//             "instantiate",
//             manifest_args!(),
//         )
//         .build();
//     let receipt = test_runner.execute_manifest_ignoring_fee(
//         manifest,
//         vec![NonFungibleGlobalId::from_public_key(&public_key)],
//     );
//     println!("{:?}\n", receipt);
//     let component = receipt.expect_commit(true).new_component_addresses()[0];

//     // Test the `free_token` method.
//     let manifest = ManifestBuilder::new()
//         .call_method(component, "free_token", manifest_args!())
//         .call_method(
//             account,
//             "deposit_batch",
//             manifest_args!(ManifestExpression::EntireWorktop),
//         )
//         .build();
//     let receipt = test_runner.execute_manifest_ignoring_fee(
//         manifest,
//         vec![NonFungibleGlobalId::from_public_key(&public_key)],
//     );
//     println!("{:?}\n", receipt);
//     receipt.expect_commit_success();
// }

#[test]
fn test_user_factory() -> Result<(), RuntimeError> {
    // Arrange
    let mut env = TestEnvironment::new();
    let package_address = Package::compile_and_publish(this_package!(), &mut env)?;

    let mut user_factory = UserFactory::instantiate(package_address, &mut env)?;

    // Create user NFT
    let user_nft = user_factory.new_user(
        "BearosSnap".to_string(),
        "Leverage Trader".to_string(),
        "https://pbs.twimg.com/profile_images/1768938778956103680/mPz6mOzD_400x400.jpg".to_string(),
        "XBearosSnap".to_string(),
        "TBearosSnap".to_string(),
        "DBearosSnap".to_string(),
        &mut env,
    )?;

    // Assert
    let user_id = user_nft;
    // assert_eq!(user_id.to_string(), "#0");

    // Update user NFT
    // let user_name = user_nft.amount(&mut env)?;
    // assert_eq!(amount, dec!("1"));

    Ok(())
}
