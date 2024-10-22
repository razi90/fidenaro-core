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
        ociswap,
        resources,
    } = ScryptoUnitTestEnv::new()?;

    let proof = protocol.trader.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;
    let _ = protocol.trade_vault.deposit(proof, bucket, env)?;

    // Act
    let result = protocol.trade_vault.swap(
        XRD,
        dec!(50),
        ociswap.pools.bitcoin.try_into().unwrap(),
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
    assert_eq!(btc_amount, dec!(48.01495442)); // we expect less than 50 BTC because of slippage

    Ok(())
}

#[test]
fn can_withdraw() -> Result<(), RuntimeError> {
    // Arrange
    let Environment {
        environment: ref mut env,
        mut protocol,
        ociswap,
        ..
    } = ScryptoUnitTestEnv::new()?;

    let proof = protocol.follower.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;

    let share_tokens =
        protocol
            .trade_vault
            .deposit(proof.clone(env).unwrap(), bucket, env)?;

    let _ = protocol
        .trade_vault
        .swap(
            XRD,
            dec!(50),
            ociswap.pools.bitcoin.try_into().unwrap(),
            env,
        )
        .expect("Swap succeeded.");

    // Split share bucket to perform partial withdrawal
    let seventy_percent_bucket = share_tokens.take(dec!(70), env)?;
    let thirty_percent_bucket = share_tokens.take(dec!(30), env)?;

    // Act
    let result_seventy_percent = protocol.trade_vault.withdraw(
        proof.clone(env).unwrap(),
        seventy_percent_bucket,
        env,
    );

    let result_thirty_percent = protocol.trade_vault.withdraw(
        proof.clone(env).unwrap(),
        thirty_percent_bucket,
        env,
    );

    // Assert
    assert!(result_seventy_percent.is_ok());
    assert!(result_thirty_percent.is_ok());

    let assets_seventy_percent = result_seventy_percent.unwrap();
    let assets_thirty_percent = result_thirty_percent.unwrap();

    assert_eq!(
        assets_seventy_percent.first().unwrap().amount(env).unwrap(),
        dec!(35)
    );
    assert_eq!(
        assets_seventy_percent.last().unwrap().amount(env).unwrap(),
        dec!(33.61049366)
    );
    assert_eq!(
        assets_thirty_percent.first().unwrap().amount(env).unwrap(),
        dec!(15)
    );
    assert_eq!(
        assets_thirty_percent.last().unwrap().amount(env).unwrap(),
        dec!(14.40449729)
    );

    Ok(())
}

#[test]
fn can_withdraw_multiple_followers() -> Result<(), RuntimeError> {
    // Arrange
    let Environment {
        environment: ref mut env,
        mut protocol,
        ..
    } = ScryptoUnitTestEnv::new()?;

    // Deposit with the first follower
    let first_follower_proof = protocol.follower.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;

    let first_follower_share_tokens = protocol.trade_vault.deposit(
        first_follower_proof.clone(env).unwrap(),
        bucket,
        env,
    )?;

    // Create a new follower
    let second_follower_token = protocol.user_factory.create_new_user(
        user_factory::UserData {
            user_name: "second_follower".to_string(),
            bio: "bio".to_string(),
            pfp_url: radix_engine_interface::prelude::UncheckedUrl(
                "http://trader-pfp.com".to_string(),
            ),
            twitter: "twitter".to_string(),
            telegram: "telegram".to_string(),
            discord: "discord".to_string(),
        },
        env,
    )?;

    // Deposit with the second follower
    let second_follower_proof =
        second_follower_token.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;

    let _ = protocol.trade_vault.deposit(
        second_follower_proof.clone(env).unwrap(),
        bucket,
        env,
    )?;

    // Act
    // Withdraw all assets from the first user
    let withdrawal = protocol
        .trade_vault
        .withdraw(
            first_follower_proof.clone(env).unwrap(),
            first_follower_share_tokens,
            env,
        )
        .expect("Withdrawl successful.");

    // Assert
    assert_eq!(withdrawal.first().unwrap().amount(env).unwrap(), dec!(100));

    Ok(())
}

#[test]
fn fidenaro_can_collect_and_withdraw_fees() -> Result<(), RuntimeError> {
    // Arrange
    let Environment {
        environment: ref mut env,
        mut protocol,
        ociswap,
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
            ociswap.pools.bitcoin.try_into().unwrap(),
            env,
        )
        .expect("Swap succeeded.");

    let _ = protocol
        .trade_vault
        .swap(
            resources.bitcoin,
            dec!(10),
            ociswap.pools.bitcoin.try_into().unwrap(),
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
fn trader_can_collect_and_withdraw_fees() -> Result<(), RuntimeError> {
    // Arrange
    let Environment {
        environment: ref mut env,
        mut protocol,
        mut ociswap,
        resources,
    } = ScryptoUnitTestEnv::new()?;

    let proof = protocol.follower.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;

    let share_tokens =
        protocol
            .trade_vault
            .deposit(proof.clone(env).unwrap(), bucket, env)?;

    protocol
        .trade_vault
        .swap(
            XRD,
            dec!(50),
            ociswap.pools.bitcoin.try_into().unwrap(),
            env,
        )
        .expect("Swap succeeded.");

    // Perform a big swap to manipulate the price
    let _ = ociswap.pools.bitcoin.swap(
        ResourceManager(XRD)
            .mint_fungible(dec!(100_000_000), env)
            .unwrap(),
        env,
    )?;

    protocol
        .trade_vault
        .withdraw(proof.clone(env).unwrap(), share_tokens, env)
        .expect("User withdraws his funds");

    // Act
    let result_xrd =
        protocol.trade_vault.withdraw_collected_trader_fee(XRD, env);
    let result_btc = protocol
        .trade_vault
        .withdraw_collected_trader_fee(resources.bitcoin, env);

    // Assert
    assert!(result_xrd.is_ok(), "Fees in XRD can be withdrawn.");
    assert!(result_btc.is_ok(), "Fees in BTC can be withdrawn.");

    let fee_xrd = result_xrd.unwrap();
    let fee_btc = result_btc.unwrap();

    assert_eq!(
        fee_xrd.amount(env).unwrap(),
        dec!(1.46649182591743929),
        "Correct amount of fee in XRD withdrawn."
    );

    assert_eq!(
        fee_btc.amount(env).unwrap(),
        dec!(1.40827183),
        "Correct amount of fee in BTC withdrawn."
    );

    Ok(())
}

#[test]
fn trader_no_fee_when_no_profit() -> Result<(), RuntimeError> {
    // Arrange
    let Environment {
        environment: ref mut env,
        mut protocol,
        mut ociswap,
        resources,
    } = ScryptoUnitTestEnv::new()?;

    let proof = protocol.follower.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;

    let share_tokens =
        protocol
            .trade_vault
            .deposit(proof.clone(env).unwrap(), bucket, env)?;

    protocol
        .trade_vault
        .swap(
            XRD,
            dec!(50),
            ociswap.pools.bitcoin.try_into().unwrap(),
            env,
        )
        .expect("Swap succeeded.");

    // Perform a big swap to manipulate the price
    let _ = ociswap.pools.bitcoin.swap(
        ResourceManager(resources.bitcoin)
            .mint_fungible(dec!(100_000_000), env)
            .unwrap(),
        env,
    )?;

    protocol
        .trade_vault
        .withdraw(
            proof.clone(env).unwrap(),
            share_tokens.take(dec!(50), env).unwrap(),
            env,
        )
        .expect("User withdraws his funds");

    // Act
    let result_xrd =
        protocol.trade_vault.withdraw_collected_trader_fee(XRD, env);
    let result_btc = protocol
        .trade_vault
        .withdraw_collected_trader_fee(resources.bitcoin, env);

    // Assert
    assert!(result_xrd.is_err(), "Fees in XRD cannot be withdrawn.");
    assert!(result_btc.is_err(), "Fees in BTC cannot be withdrawn.");

    Ok(())
}

#[test]
fn swap_with_small_amount() -> Result<(), RuntimeError> {
    // Arrange
    let Environment {
        environment: ref mut env,
        mut protocol,
        ociswap,
        resources,
    } = ScryptoUnitTestEnv::new()?;

    let proof = protocol.trader.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;
    let _ = protocol.trade_vault.deposit(proof, bucket, env)?;

    // Act
    protocol
        .trade_vault
        .swap(
            XRD,
            dec!(10),
            ociswap.pools.bitcoin.try_into().unwrap(),
            env,
        )
        .expect("Swap succeeded.");

    protocol
        .trade_vault
        .swap(
            resources.bitcoin,
            dec!(0.00000009),
            ociswap.pools.bitcoin.try_into().unwrap(),
            env,
        )
        .expect("Swap succeeded.");

    // Assert
    let [xrd_amount, btc_amount] = [XRD, resources.bitcoin].map(|resource| {
        env.with_component_state::<TradeVaultState, _, _, _>(
            protocol.trade_vault,
            |state, env| state.assets.get(&resource).unwrap().amount(env),
        )
        .unwrap()
        .unwrap()
    });

    assert_eq!(xrd_amount, dec!(90.000000070000005273));
    assert_eq!(btc_amount, dec!(9.60299954));

    Ok(())
}

#[test]
fn abort_when_received_amount_rounded_to_zero() -> Result<(), RuntimeError> {
    // Arrange
    let Environment {
        environment: ref mut env,
        mut protocol,
        ociswap,
        ..
    } = ScryptoUnitTestEnv::new()?;

    let proof = protocol.trader.0.create_proof_of_all(env)?;
    let bucket = ResourceManager(XRD).mint_fungible(dec!(100), env)?;
    let _ = protocol.trade_vault.deposit(proof, bucket, env)?;

    // Act
    let result = protocol.trade_vault.swap(
        XRD,
        dec!(0.00000000001),
        ociswap.pools.bitcoin.try_into().unwrap(),
        env,
    );

    // Assert
    assert!(
        result.is_err(),
        "Trade shall fail when BTC amount is rounded to 0."
    );

    Ok(())
}
