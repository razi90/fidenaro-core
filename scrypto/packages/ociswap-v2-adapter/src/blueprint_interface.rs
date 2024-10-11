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

use scrypto::prelude::*;
use scrypto_interface::*;

define_interface! {
    PrecisionPool impl [
        ScryptoStub,
        ScryptoTestStub,
        #[cfg(feature = "manifest-builder-stubs")]
        ManifestBuilderStub
    ] {
        fn instantiate(
            x_address: ResourceAddress,
            y_address: ResourceAddress,
            price_sqrt: PreciseDecimal,
            tick_spacing: u32,
            input_fee_rate: Decimal,
            flash_loan_fee_rate: Decimal,
            registry_address: ComponentAddress,
            #[manifest_type = "Vec<(ComponentAddress, ManifestBucket)>"]
            hook_badges: Vec<(ComponentAddress, Bucket)>,
            dapp_definition: ComponentAddress
        ) -> (Self, ResourceAddress);
        fn instantiate_with_liquidity(
            #[manifest_type = "ManifestBucket"]
            x_bucket: Bucket,
            #[manifest_type = "ManifestBucket"]
            y_bucket: Bucket,
            price_sqrt: PreciseDecimal,
            tick_spacing: u32,
            input_fee_rate: Decimal,
            flash_loan_fee_rate: Decimal,
            registry_address: ComponentAddress,
            #[manifest_type = "Vec<(ComponentAddress, ManifestBucket)>"]
            hook_badges: Vec<(ComponentAddress, Bucket)>,
            dapp_definition: ComponentAddress,
            left_bound: i32,
            right_bound: i32
        ) -> (Self, ResourceAddress, Bucket, Bucket, Bucket);
        fn add_liquidity(
            &mut self,
            left_bound: i32,
            right_bound: i32,
            #[manifest_type = "ManifestBucket"]
            x_bucket: Bucket,
            #[manifest_type = "ManifestBucket"]
            y_bucket: Bucket
        ) -> (Bucket, Bucket, Bucket);
        fn swap(
            &mut self,
            #[manifest_type = "ManifestBucket"]
            input_bucket: Bucket
        ) -> (Bucket, Bucket);
        fn x_address(&self) -> ResourceAddress;
        fn y_address(&self) -> ResourceAddress;
        fn price_sqrt(&self) -> PreciseDecimal;
    }
}

define_interface! {
    Registry impl [
        ScryptoStub,
        ScryptoTestStub,
        #[cfg(feature = "manifest-builder-stubs")]
        ManifestBuilderStub
    ] {
        fn instantiate(
            owner_badge_address: ResourceAddress,
            fee_protocol_share: Decimal,
            sync_period: u64,
            sync_slots: u64
        ) -> Self;
    }
}
