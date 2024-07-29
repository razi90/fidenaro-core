use scrypto_test::prelude::*;
use std::sync::{Mutex, Once};

use tests::prelude::*;

// Global variables for environment and snapshots
static INIT: Once = Once::new();
static mut ENV: Option<Mutex<ScryptoSimulatorEnv>> = None;
static mut SNAPSHOT: Option<Mutex<LedgerSimulatorSnapshot>> = None;

fn init_env() {
    // Initialize the environment and take a snapshot
    unsafe {
        INIT.call_once(|| {
            let env = ScryptoSimulatorEnv::new();
            let snapshot = env.environment.create_snapshot();
            ENV = Some(Mutex::new(env));
            SNAPSHOT = Some(Mutex::new(snapshot));
        });
    }
}

fn restore_env() {
    // Restore the environment from the snapshot
    unsafe {
        if let (Some(env_mutex), Some(snapshot_mutex)) =
            (ENV.as_ref(), SNAPSHOT.as_ref())
        {
            let mut env = env_mutex.lock().unwrap();
            let snapshot = snapshot_mutex.lock().unwrap();
            env.environment.restore_snapshot(snapshot.clone());
        }
    }
}

#[test]
fn test_common_user_interactions() {
    init_env();
    restore_env();

    unsafe {
        if let Some(env_mutex) = ENV.as_ref() {
            let mut env = env_mutex.lock().unwrap();

            // let follower deposit into a vault
            let manifest = ManifestBuilder::new()
                .lock_fee_from_faucet()
                .create_proof_from_account_of_non_fungible(
                    env.protocol.follower.0,
                    env.protocol.follower.1.clone(),
                )
                .create_proof_from_auth_zone_of_non_fungibles(
                    env.protocol.follower.1.resource_address(),
                    indexset!(env.protocol.follower.1.local_id().clone()),
                    "proof",
                )
                .withdraw_from_account(env.protocol.follower.0, XRD, 100)
                .take_all_from_worktop(XRD, "bucket")
                .call_method_with_name_lookup(
                    env.protocol.trade_vault,
                    "deposit",
                    |lookup| (lookup.proof("proof"), (lookup.bucket("bucket"))),
                )
                .try_deposit_entire_worktop_or_abort(
                    env.protocol.follower.0,
                    None,
                )
                .build();
            env.environment
                .execute_manifest_without_auth(manifest)
                .expect_commit_success();

            // let trader perform a swap
            let manifest = ManifestBuilder::new()
                .lock_fee_from_faucet()
                .create_proof_from_account_of_amount(
                    env.protocol.trader.0,
                    env.protocol.trade_vault_admin_badge.3,
                    1,
                )
                .call_method(
                    env.protocol.trade_vault,
                    "swap",
                    (XRD, dec!(10), env.radiswap.pools.bitcoin),
                )
                .build();
            env.environment
                .execute_manifest_without_auth(manifest)
                .expect_commit_success();

            // let follower withdraw from vault
            let manifest = ManifestBuilder::new()
                .lock_fee_from_faucet()
                .create_proof_from_account_of_non_fungible(
                    env.protocol.follower.0,
                    env.protocol.follower.1.clone(),
                )
                .create_proof_from_auth_zone_of_non_fungibles(
                    env.protocol.follower.1.resource_address(),
                    indexset!(env.protocol.follower.1.local_id().clone()),
                    "proof",
                )
                .withdraw_from_account(
                    env.protocol.follower.0,
                    env.protocol.trade_vault_share_token,
                    10,
                )
                .take_all_from_worktop(
                    env.protocol.trade_vault_share_token,
                    "shares",
                )
                .call_method_with_name_lookup(
                    env.protocol.trade_vault,
                    "withdraw",
                    |lookup| (lookup.proof("proof"), (lookup.bucket("shares"))),
                )
                .try_deposit_entire_worktop_or_abort(
                    env.protocol.follower.0,
                    None,
                )
                .build();
            env.environment
                .execute_manifest_without_auth(manifest)
                .expect_commit_success();
        }
    }
}