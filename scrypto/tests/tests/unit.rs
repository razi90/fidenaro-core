use tests::prelude::*;

#[test]
fn simple_testing_environment_can_be_created() {
    ScryptoUnitTestEnv::new().expect("Must succeed!");
}
