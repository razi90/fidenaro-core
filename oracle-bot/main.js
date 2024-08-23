"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecureRandomBytes = generateSecureRandomBytes;
const babylon_gateway_api_sdk_1 = require("@radixdlt/babylon-gateway-api-sdk");
const radix_engine_toolkit_1 = require("@radixdlt/radix-engine-toolkit");
const axios_1 = __importDefault(require("axios"));
function generateSecureRandomBytes(count) {
    return __awaiter(this, void 0, void 0, function* () {
        const { webcrypto } = require('crypto');
        const byteArray = new Uint8Array(count);
        webcrypto.getRandomValues(byteArray);
        return byteArray;
    });
}
const NetworkConfiguration = {
    gatewayBaseUrl: "https://stokenet-gateway.radix.live",
    networkId: babylon_gateway_api_sdk_1.RadixNetwork.Stokenet,
};
function getPricesCoinGecko() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // Make a GET request to the CoinGecko API
            const response = yield axios_1.default.get('https://api.coingecko.com/api/v3/coins/markets', {
                params: {
                    ids: "bitcoin,ethereum,hug,radix",
                    vs_currency: 'usd',
                    x_cg_demo_api_key: 'CG-aaMH55diwUGfAbPBSo3FA2uY'
                }
            });
            // Create a map to store the prices in Radix
            const pricesInRadix = {};
            // Find the price of Radix in USD
            const radixPrice = (_a = response.data.find((coin) => coin.id === "radix")) === null || _a === void 0 ? void 0 : _a.current_price;
            if (!radixPrice) {
                throw new Error("Radix price not found");
            }
            // Calculate the price of USDC in Radix (since USDC is 1 USD)
            pricesInRadix["usdc"] = parseFloat((1 / radixPrice).toFixed(18));
            // Iterate over the response data and calculate the price ratios
            response.data.forEach((coin) => {
                if (coin.id !== "radix") {
                    pricesInRadix[coin.id] = parseFloat((coin.current_price / radixPrice).toFixed(18));
                }
            });
            // Log the prices in Radix
            console.log('Prices in Radix (XRD):', pricesInRadix);
            return pricesInRadix;
        }
        catch (error) {
            console.error('Error fetching prices:', error);
            return {};
        }
    });
}
function getPricesCaviarNine() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const asset_address_map = new Map([
                ["bitcoin", "resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75"],
                ["ethereum", "resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww"],
                ["hug", "resource_rdx1t5kmyj54jt85malva7fxdrnpvgfgs623yt7ywdaval25vrdlmnwe97"],
                ["usdc", "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf"],
            ]);
            const response = yield axios_1.default.get('https://api-core.caviarnine.com/v1.0/public/tokens');
            const asset_price_map = {};
            for (const [assetName, address] of asset_address_map.entries()) {
                const resourceData = response.data.data[address];
                if (resourceData) {
                    asset_price_map[assetName] = resourceData.price_to_xrd.mid;
                }
            }
            return asset_price_map;
        }
        catch (error) {
            console.error('Error fetching prices:', error);
            return {};
        }
    });
}
const getCurrentEpoch = (statusApi) => __awaiter(void 0, void 0, void 0, function* () { return statusApi.gatewayStatus().then((output) => output.ledger_state.epoch); });
const submitTransaction = (transactionApi, compiledTransaction) => __awaiter(void 0, void 0, void 0, function* () {
    return transactionApi.transactionSubmit({
        transactionSubmitRequest: {
            notarized_transaction_hex: radix_engine_toolkit_1.Convert.Uint8Array.toHexString(compiledTransaction),
        },
    });
});
const getTransactionStatus = (transactionApi, transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    return transactionApi.transactionStatus({
        transactionStatusRequest: {
            intent_hash: transactionId.id,
        },
    });
});
const fetchPricesAndSendTransaction = (statusApi, transactionApi, notaryPrivateKey) => __awaiter(void 0, void 0, void 0, function* () {
    // Building the manifest of this example. The manifest for this example will be quite simple: it
    // will lock some amount of XRD in fees from the faucet's component.
    const faucetComponentAddress = yield radix_engine_toolkit_1.RadixEngineToolkit.Utils.knownAddresses(NetworkConfiguration.networkId).then((addressBook) => addressBook.componentAddresses.faucet);
    let prices = yield getPricesCaviarNine();
    const manifest = new radix_engine_toolkit_1.ManifestBuilder()
        .callMethod(faucetComponentAddress, "lock_fee", [(0, radix_engine_toolkit_1.decimal)(10)])
        .callMethod("component_tdx_2_1cpyxkkquzt2rfz908t8yt5vjsdhtegrsasq8us2s6ng5kz7pncupsf", "set_price", [
        (0, radix_engine_toolkit_1.address)("resource_tdx_2_1t4vmx0vezqqrcqhzlt0sxcphw63n73fsxve3nvrn8y5c5dyxk3fxuf"),
        (0, radix_engine_toolkit_1.address)("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"),
        (0, radix_engine_toolkit_1.decimal)(prices['bitcoin'])
    ])
        .callMethod("component_tdx_2_1cpyxkkquzt2rfz908t8yt5vjsdhtegrsasq8us2s6ng5kz7pncupsf", "set_price", [
        (0, radix_engine_toolkit_1.address)("resource_tdx_2_1tkky3adz9kjyv534amy29uxrqg28uvr8ygm09g4wwr37zajrn0zldg"),
        (0, radix_engine_toolkit_1.address)("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"),
        (0, radix_engine_toolkit_1.decimal)(prices['ethereum'])
    ])
        .callMethod("component_tdx_2_1cpyxkkquzt2rfz908t8yt5vjsdhtegrsasq8us2s6ng5kz7pncupsf", "set_price", [
        (0, radix_engine_toolkit_1.address)("resource_tdx_2_1thtxzder4ncupdg47h6zktdnl6p4yqznttv6nuxvzcsntfhthz6m6m"),
        (0, radix_engine_toolkit_1.address)("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"),
        (0, radix_engine_toolkit_1.decimal)(prices['hug'])
    ])
        .callMethod("component_tdx_2_1cpyxkkquzt2rfz908t8yt5vjsdhtegrsasq8us2s6ng5kz7pncupsf", "set_price", [
        (0, radix_engine_toolkit_1.address)("resource_tdx_2_1tkr36auhr7jpn07yvktk3u6s5stcm9vrdgf0xhdym9gv096v4q7thf"),
        (0, radix_engine_toolkit_1.address)("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"),
        (0, radix_engine_toolkit_1.decimal)(prices['usdc'])
    ])
        .build();
    // With the manifest constructed above, we may now construct the complete transaction. Part of the
    // transaction construction requires knowledge of the ledger state, more specifically, we need to
    // have knowledge of the current epoch of the network to set the epoch bounds in the transaction
    // header. This information can be obtained from the gateway API through the status API.
    const currentEpoch = yield getCurrentEpoch(statusApi);
    const notarizedTransaction = yield radix_engine_toolkit_1.TransactionBuilder.new().then((builder) => builder
        .header({
        networkId: NetworkConfiguration.networkId,
        startEpochInclusive: currentEpoch,
        endEpochExclusive: currentEpoch + 10,
        nonce: (0, radix_engine_toolkit_1.generateRandomNonce)(),
        notaryPublicKey: notaryPrivateKey.publicKey(),
        notaryIsSignatory: true,
        tipPercentage: 0,
    })
        .manifest(manifest)
        .notarize(notaryPrivateKey));
    // After the transaction has been built, we can get the transaction id (transaction hash) which is
    // the identifier used to get information on this transaction through the gateway.
    const transactionId = yield radix_engine_toolkit_1.RadixEngineToolkit.NotarizedTransaction.intentHash(notarizedTransaction);
    console.log("Transaction ID:", transactionId);
    // After the transaction has been built, it can be printed to the console as a JSON string if the
    // developer wishes to inspect it visually in any way.
    console.log("Transaction:", notarizedTransaction);
    // To submit the transaction to the Gateway API, it must first be compiled or converted from its
    // human readable format down to an array of bytes that can be consumed by the gateway. This can
    // be done by calling the compile method on the transaction object.
    const compiledTransaction = yield radix_engine_toolkit_1.RadixEngineToolkit.NotarizedTransaction.compile(notarizedTransaction);
    console.log("Compiled Transaction:", radix_engine_toolkit_1.Convert.Uint8Array.toHexString(compiledTransaction));
    // Now that we have the compiled transaction, we can submit it to the Gateway API.
    console.log("Will submit now");
    const submissionResult = yield submitTransaction(transactionApi, compiledTransaction);
    console.log("Transaction submission result:", submissionResult);
    // There will be some time needed for the transaction to be propagated to nodes and then processed
    // by the network. We will poll the transaction status until the transaction is eventually
    // committed
    let transactionStatus = undefined;
    while (transactionStatus === undefined ||
        (transactionStatus === null || transactionStatus === void 0 ? void 0 : transactionStatus.status) === babylon_gateway_api_sdk_1.TransactionStatus.Pending) {
        transactionStatus = yield getTransactionStatus(transactionApi, transactionId);
        yield new Promise((r) => setTimeout(r, 1000));
    }
    console.log("Transaction Status:", transactionStatus);
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    // Setting up the Gateway Sub-APIs that will be used in this example. We will be utilizing two sub
    // APIs: the Status API to get the current epoch and the transaction API to submit and query the
    // status of transactions on the network.
    const apiConfiguration = new babylon_gateway_api_sdk_1.Configuration({
        basePath: NetworkConfiguration.gatewayBaseUrl,
    });
    const statusApi = new babylon_gateway_api_sdk_1.StatusApi(apiConfiguration);
    const transactionApi = new babylon_gateway_api_sdk_1.TransactionApi(apiConfiguration);
    // Setting up the private key of the transaction notary.
    const notaryPrivateKey = new radix_engine_toolkit_1.PrivateKey.Ed25519(yield generateSecureRandomBytes(32));
    fetchPricesAndSendTransaction(statusApi, transactionApi, notaryPrivateKey);
    setInterval(() => fetchPricesAndSendTransaction(statusApi, transactionApi, notaryPrivateKey), 60 * 1000); // every minute
});
main();
