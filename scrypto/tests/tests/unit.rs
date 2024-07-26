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

    let proof = protocol.follower.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;

    // Act
    let shares = protocol.trade_vault.deposit(proof, bucket, env)?;

    // Assert
    assert_eq!(shares.amount(env)?, dec!(100));

    Ok(())
}

#[test]
fn cant_deposit_other_assets_than_xrd() -> Result<(), RuntimeError> {
    // Arrange
    let Environment {
        environment: ref mut env,
        mut protocol,
        ..
    } = ScryptoUnitTestEnv::new()?;

    let proof = protocol.follower.0.create_proof_of_all(env)?;
    let bucket = ResourceBuilder::new_fungible(OwnerRole::None)
        .divisibility(18)
        .mint_initial_supply(100, env)?;

    // Act
    let result = protocol.trade_vault.deposit(proof, bucket, env);

    // Assert
    assert!(result.is_err());

    Ok(())
}

#[test]
fn can_swap() -> Result<(), RuntimeError> {
    // Arrange
    let Environment {
        environment: ref mut env,
        mut protocol,
        radiswap,
        ..
    } = ScryptoUnitTestEnv::new()?;

    let proof = protocol.trader.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;
    let _ = protocol.trade_vault.deposit(proof, bucket, env)?;

    // Act
    let result = protocol.trade_vault.swap(
        XRD,
        dec!(100),
        radiswap.pools.bitcoin.try_into().unwrap(),
        env,
    );

    // Assert
    assert!(result.is_ok());

    Ok(())
}
