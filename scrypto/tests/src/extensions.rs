// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

use crate::prelude::*;
use extend::ext;
use radix_engine::updates::DefaultForNetwork;

#[ext]
pub impl DefaultLedgerSimulator {
    fn execute_manifest_without_auth(
        &mut self,
        manifest: TransactionManifestV1,
        owner_public_key: Secp256k1PublicKey,
    ) -> TransactionReceiptV1 {
        let system_overrides =
            SystemOverrides::default_for_network(&NetworkDefinition::simulator());
        system_overrides.disable_auth;
        self.execute_manifest_with_enabled_modules(
            manifest,
            Some(system_overrides),
            owner_public_key,
        )
    }

    fn execute_manifest_with_enabled_modules(
        &mut self,
        manifest: TransactionManifestV1,
        system_overrides: Option<SystemOverrides>,
        owner_public_key: Secp256k1PublicKey,
    ) -> TransactionReceiptV1 {
        let mut execution_config = ExecutionConfig::for_test_transaction();
        execution_config.system_overrides = system_overrides;

        let nonce = self.next_transaction_nonce();
        let test_transaction = TestTransaction::new_from_nonce(manifest, nonce);
        let prepared_transaction = test_transaction.prepare().unwrap();
        let executable =
            prepared_transaction.get_executable(btreeset![NonFungibleGlobalId::from_public_key(
                &owner_public_key,
            )]);
        self.execute_transaction(executable, execution_config)
    }
}
