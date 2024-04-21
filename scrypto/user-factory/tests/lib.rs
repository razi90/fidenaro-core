use radix_engine_interface::prelude::*;

use test_engine::{env_args, global_package, receipt_traits::Outcome, test_engine::TestEngine};

#[test]
fn test_create_new_user() {
    global_package!(USER_FACTORY_PACKAGE, ".");

    // Instantiate a new test engine with a global package.
    let mut test_engine = TestEngine::with_package("UserFactory", &USER_FACTORY_PACKAGE);

    // Instantiate the user factory component from the blueprint
    test_engine.new_component(
        "user_factory", // Name to use as reference
        "UserFactory",  // Name of the component in the package
        "instantiate",  // Name of the function that instantiates the component
        env_args!(),    // Arguments to instantiate the package
    );

    test_engine
        .call_method(
            "create_new_user", // Name of the method to call
            env_args!(
                "BearosSnap",
                "Leverage Trader",
                "https://pbs.twimg.com/profile_images/1768938778956103680/mPz6mOzD_400x400.jpg",
                "XBearosSnap",
                "TBearosSnap",
                "DBearosSnap"
            ),
        )
        .assert_is_success();
}
