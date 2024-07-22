use scrypto_test::prelude::*;
use std::sync::{Mutex, Once};

use tests::prelude::*;

// Global variables for environment and snapshots
static INIT: Once = Once::new();
static mut ENV: Option<Mutex<ScryptoUnitEnv>> = None;
static mut SNAPSHOT: Option<Mutex<LedgerSimulatorSnapshot>> = None;

fn init_env() {
    // Initialize the environment and take a snapshot
    unsafe {
        INIT.call_once(|| {
            let env = ScryptoUnitEnv::new();
            let snapshot = env.ledger_simulator.create_snapshot();
            ENV = Some(Mutex::new(env));
            SNAPSHOT = Some(Mutex::new(snapshot));
        });
    }
}

fn restore_env() {
    // Restore the environment from the snapshot
    unsafe {
        if let (Some(env_mutex), Some(snapshot_mutex)) = (ENV.as_ref(), SNAPSHOT.as_ref()) {
            let mut env = env_mutex.lock().unwrap();
            let snapshot = snapshot_mutex.lock().unwrap();
            env.ledger_simulator.restore_snapshot(snapshot.clone());
        }
    }
}

#[test]
fn can_deposit() {
    init_env();
    restore_env();

    // Here you can use the environment for your test
    unsafe {
        if let Some(env_mutex) = ENV.as_ref() {
            let env = env_mutex.lock().unwrap();
            // Do your test with env
        }
    }
}

#[test]
fn can_swap() {
    init_env();
    restore_env();

    // Here you can use the environment for your test
    unsafe {
        if let Some(env_mutex) = ENV.as_ref() {
            let env = env_mutex.lock().unwrap();
            // Do your test with env
        }
    }
}

#[test]
fn can_withdraw() {
    init_env();
    restore_env();

    // Here you can use the environment for your test
    unsafe {
        if let Some(env_mutex) = ENV.as_ref() {
            let env = env_mutex.lock().unwrap();
            // Do your test with env
        }
    }
}
