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
        resources,
    } = ScryptoUnitTestEnv::new()?;

    let proof = protocol.trader.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;
    let _ = protocol.trade_vault.deposit(proof, bucket, env)?;

    // Act
    let result = protocol.trade_vault.swap(
        XRD,
        dec!(50),
        radiswap.pools.bitcoin.try_into().unwrap(),
        env,
    );

    // Assert
    assert!(result.is_ok());

    let [xrd_amount, btc_amount] = [XRD, resources.bitcoin].map(|resource| {
        env.with_component_state::<TradeVaultState, _, _, _>(
            protocol.trade_vault,
            |state, env| state.assets.get(&resource).unwrap().amount(env),
        )
        .unwrap()
        .unwrap()
    });

    assert_eq!(xrd_amount, dec!(50));
    assert_eq!(btc_amount, dec!(49.49997549)); // we expect less than 50 BTC because of slippage

    Ok(())
}

#[test]
fn test_fidenaro_can_collect_and_withdraw_fees() -> Result<(), RuntimeError> {
    // Arrange
    let Environment {
        environment: ref mut env,
        mut protocol,
        radiswap,
        resources,
    } = ScryptoUnitTestEnv::new()?;

    let proof = protocol.trader.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;
    let _ = protocol.trade_vault.deposit(proof, bucket, env)?;

    // Act
    let _ = protocol
        .trade_vault
        .swap(
            XRD,
            dec!(50),
            radiswap.pools.bitcoin.try_into().unwrap(),
            env,
        )
        .expect("Swap succeeded.");

    let _ = protocol
        .trade_vault
        .swap(
            resources.bitcoin,
            dec!(10),
            radiswap.pools.bitcoin.try_into().unwrap(),
            env,
        )
        .expect("Swap succeeded.");

    // Assert
    let result_xrd = protocol.fidenaro.withdraw_collected_fee(XRD, env);
    let result_btc = protocol
        .fidenaro
        .withdraw_collected_fee(resources.bitcoin, env);

    assert!(result_xrd.is_ok(), "Fees in XRD can be withdrawn.");
    assert!(result_btc.is_ok(), "Fees in BTC can be withdrawn.");

    let fee_xrd = result_xrd.unwrap();
    let fee_btc = result_btc.unwrap();

    assert_eq!(
        fee_xrd.amount(env).unwrap(),
        dec!(0.5),
        "Collected fees are 0.5 XRD."
    );

    assert_eq!(
        fee_btc.amount(env).unwrap(),
        dec!(0.1),
        "Collected fees are 0.1 BTC."
    );

    Ok(())
}

#[test]
fn test_trader_can_collect_and_withdraw_fees() -> Result<(), RuntimeError> {
    // Arrange
    let Environment {
        environment: ref mut env,
        mut protocol,
        radiswap,
        resources,
    } = ScryptoUnitTestEnv::new()?;

    let proof = protocol.trader.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;
    let _ = protocol.trade_vault.deposit(proof, bucket, env)?;

    // Act
    let _ = protocol.trade_vault.swap(
        XRD,
        dec!(50),
        radiswap.pools.bitcoin.try_into().unwrap(),
        env,
    );

    // Assert
    todo!();

    Ok(())
}
