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

import {
    Configuration,
    RadixNetwork,
    StatusApi,
    TransactionApi,
    TransactionStatus,
    TransactionStatusResponse,
    TransactionSubmitResponse,
} from "@radixdlt/babylon-gateway-api-sdk";
import {
    Convert,
    ManifestBuilder,
    PrivateKey,
    RadixEngineToolkit,
    TransactionBuilder,
    TransactionHash,
    address,
    decimal,
    generateRandomNonce,
} from "@radixdlt/radix-engine-toolkit";
import axios from 'axios';

export async function generateSecureRandomBytes(
    count: number
): Promise<Uint8Array> {
    const { webcrypto } = require('crypto');
    const byteArray = new Uint8Array(count);
    webcrypto.getRandomValues(byteArray);
    return byteArray;
}

const NetworkConfiguration = {
    gatewayBaseUrl: "https://stokenet-gateway.radix.live",
    networkId: RadixNetwork.Stokenet,
};

// Utility function to delay execution for a given number of milliseconds
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry wrapper for a function that returns a promise
async function retry<T>(fn: () => Promise<T>, retries: number = 3, delayMs: number = 1000): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i < retries - 1) {
                console.warn(`Retrying... (${i + 1}/${retries})`);
                await delay(delayMs * Math.pow(2, i)); // Exponential backoff
            } else {
                console.error('Max retries reached. Throwing error.');
                throw error;
            }
        }
    }
    throw new Error('Retry function failed after all attempts');
}

async function getPricesCoinGecko(): Promise<{ [key: string]: number }> {
    try {
        // Make a GET request to the CoinGecko API
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
                ids: "bitcoin,ethereum,hug,radix",
                vs_currency: 'usd',
                x_cg_demo_api_key: 'CG-aaMH55diwUGfAbPBSo3FA2uY'
            }
        });

        // Create a map to store the prices in Radix
        const pricesInRadix: { [key: string]: number } = {};

        // Find the price of Radix in USD
        const radixPrice = response.data.find((coin: any) => coin.id === "radix")?.current_price;

        if (!radixPrice) {
            throw new Error("Radix price not found");
        }

        // Calculate the price of USDC in Radix (since USDC is 1 USD)
        pricesInRadix["usdc"] = parseFloat((1 / radixPrice).toFixed(18));

        // Iterate over the response data and calculate the price ratios
        response.data.forEach((coin: any) => {
            if (coin.id !== "radix") {
                pricesInRadix[coin.id] = parseFloat((coin.current_price / radixPrice).toFixed(18));
            }
        });

        // Log the prices in Radix
        console.log('Prices in Radix (XRD):', pricesInRadix);

        return pricesInRadix;
    } catch (error) {
        console.error('Error fetching prices:', error);
        return {};
    }
}

async function getPricesCaviarNine(): Promise<{ [key: string]: string }> {
    return retry(async () => {
        const asset_address_map = new Map<string, string>([
            ["bitcoin", "resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75"],
            ["ethereum", "resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww"],
            ["hug", "resource_rdx1t5kmyj54jt85malva7fxdrnpvgfgs623yt7ywdaval25vrdlmnwe97"],
            ["usdc", "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf"],
        ]);

        const response = await axios.get('https://api-core.caviarnine.com/v1.0/public/tokens');
        const asset_price_map: { [key: string]: string } = {};

        for (const [assetName, address] of asset_address_map.entries()) {
            const resourceData = response.data.data[address];
            if (resourceData) {
                asset_price_map[assetName] = resourceData.price_to_xrd.mid;
            }
        }

        return asset_price_map;
    });
}

const getCurrentEpoch = async (statusApi: StatusApi): Promise<number> =>
    statusApi.gatewayStatus().then((output: { ledger_state: { epoch: any; }; }) => output.ledger_state.epoch);

const submitTransaction = async (
    transactionApi: TransactionApi,
    compiledTransaction: Uint8Array
): Promise<TransactionSubmitResponse> =>
    transactionApi.transactionSubmit({
        transactionSubmitRequest: {
            notarized_transaction_hex:
                Convert.Uint8Array.toHexString(compiledTransaction),
        },
    });

const getTransactionStatus = async (
    transactionApi: TransactionApi,
    transactionId: TransactionHash
): Promise<TransactionStatusResponse> =>
    transactionApi.transactionStatus({
        transactionStatusRequest: {
            intent_hash: transactionId.id,
        },
    });

const fetchPricesAndSendTransaction = async (statusApi: StatusApi, transactionApi: TransactionApi, notaryPrivateKey: PrivateKey) => {
    // Building the manifest of this example. The manifest for this example will be quite simple: it
    // will lock some amount of XRD in fees from the faucet's component.
    const faucetComponentAddress = await RadixEngineToolkit.Utils.knownAddresses(
        NetworkConfiguration.networkId
    ).then((addressBook) => addressBook.componentAddresses.faucet);

    let prices = await getPricesCaviarNine();

    const manifest = new ManifestBuilder()
        .callMethod(faucetComponentAddress, "lock_fee", [decimal(10)])
        .callMethod(
            "component_tdx_2_1cpyxkkquzt2rfz908t8yt5vjsdhtegrsasq8us2s6ng5kz7pncupsf",
            "set_price",
            [
                address("resource_tdx_2_1t4vmx0vezqqrcqhzlt0sxcphw63n73fsxve3nvrn8y5c5dyxk3fxuf"),
                address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"),
                decimal(prices['bitcoin'])
            ]
        )
        .callMethod(
            "component_tdx_2_1cpyxkkquzt2rfz908t8yt5vjsdhtegrsasq8us2s6ng5kz7pncupsf",
            "set_price",
            [
                address("resource_tdx_2_1tkky3adz9kjyv534amy29uxrqg28uvr8ygm09g4wwr37zajrn0zldg"),
                address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"),
                decimal(prices['ethereum'])
            ]
        )
        .callMethod(
            "component_tdx_2_1cpyxkkquzt2rfz908t8yt5vjsdhtegrsasq8us2s6ng5kz7pncupsf",
            "set_price",
            [
                address("resource_tdx_2_1thtxzder4ncupdg47h6zktdnl6p4yqznttv6nuxvzcsntfhthz6m6m"),
                address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"),
                decimal(prices['hug'])
            ]
        )
        .callMethod(
            "component_tdx_2_1cpyxkkquzt2rfz908t8yt5vjsdhtegrsasq8us2s6ng5kz7pncupsf",
            "set_price",
            [
                address("resource_tdx_2_1tkr36auhr7jpn07yvktk3u6s5stcm9vrdgf0xhdym9gv096v4q7thf"),
                address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"),
                decimal(prices['usdc'])
            ]
        )
        .build();

    // With the manifest constructed above, we may now construct the complete transaction. Part of the
    // transaction construction requires knowledge of the ledger state, more specifically, we need to
    // have knowledge of the current epoch of the network to set the epoch bounds in the transaction
    // header. This information can be obtained from the gateway API through the status API.
    const currentEpoch = await getCurrentEpoch(statusApi);
    const notarizedTransaction = await TransactionBuilder.new().then((builder) =>
        builder
            .header({
                networkId: NetworkConfiguration.networkId,
                startEpochInclusive: currentEpoch,
                endEpochExclusive: currentEpoch + 10,
                nonce: generateRandomNonce(),
                notaryPublicKey: notaryPrivateKey.publicKey(),
                notaryIsSignatory: true,
                tipPercentage: 0,
            })
            .manifest(manifest)
            .notarize(notaryPrivateKey)
    );
    // After the transaction has been built, we can get the transaction id (transaction hash) which is
    // the identifier used to get information on this transaction through the gateway.
    const transactionId =
        await RadixEngineToolkit.NotarizedTransaction.intentHash(
            notarizedTransaction
        );
    console.log("Transaction ID:", transactionId);

    // After the transaction has been built, it can be printed to the console as a JSON string if the
    // developer wishes to inspect it visually in any way.
    console.log("Transaction:", notarizedTransaction);

    // To submit the transaction to the Gateway API, it must first be compiled or converted from its
    // human readable format down to an array of bytes that can be consumed by the gateway. This can
    // be done by calling the compile method on the transaction object.
    const compiledTransaction =
        await RadixEngineToolkit.NotarizedTransaction.compile(notarizedTransaction);
    console.log(
        "Compiled Transaction:",
        Convert.Uint8Array.toHexString(compiledTransaction)
    );

    // Now that we have the compiled transaction, we can submit it to the Gateway API.
    console.log("Will submit now");
    const submissionResult = await submitTransaction(
        transactionApi,
        compiledTransaction
    );
    console.log("Transaction submission result:", submissionResult);

    // There will be some time needed for the transaction to be propagated to nodes and then processed
    // by the network. We will poll the transaction status until the transaction is eventually
    // committed
    let transactionStatus = undefined;
    while (
        transactionStatus === undefined ||
        transactionStatus?.status === TransactionStatus.Pending
    ) {
        transactionStatus = await getTransactionStatus(
            transactionApi,
            transactionId
        );
        await new Promise((r) => setTimeout(r, 1000));
    }
    console.log("Transaction Status:", transactionStatus);
}

const main = async () => {
    const apiConfiguration = new Configuration({
        basePath: NetworkConfiguration.gatewayBaseUrl,
    });
    const statusApi = new StatusApi(apiConfiguration);
    const transactionApi = new TransactionApi(apiConfiguration);

    const notaryPrivateKey = new PrivateKey.Ed25519(await generateSecureRandomBytes(32));
    fetchPricesAndSendTransaction(statusApi, transactionApi, notaryPrivateKey);
    setInterval(() => fetchPricesAndSendTransaction(statusApi, transactionApi, notaryPrivateKey), 60 * 1000); // every minute
};

main();