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

async function getPrices(): Promise<{ [key: string]: number }> {
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

    let prices = await getPrices();

    const manifest = new ManifestBuilder()
        .callMethod(faucetComponentAddress, "lock_fee", [decimal(10)])
        .callMethod(
            "component_tdx_2_1cpyxkkquzt2rfz908t8yt5vjsdhtegrsasq8us2s6ng5kz7pncupsf",
            "set_price",
            [
                address("resource_tdx_2_1t4vmx0vezqqrcqhzlt0sxcphw63n73fsxve3nvrn8y5c5dyxk3fxuf"),
                address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"),
                decimal(prices['bitcoin'].toString())
            ]
        )
        .callMethod(
            "component_tdx_2_1cpyxkkquzt2rfz908t8yt5vjsdhtegrsasq8us2s6ng5kz7pncupsf",
            "set_price",
            [
                address("resource_tdx_2_1tkky3adz9kjyv534amy29uxrqg28uvr8ygm09g4wwr37zajrn0zldg"),
                address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"),
                decimal(prices['ethereum'].toString())
            ]
        )
        .callMethod(
            "component_tdx_2_1cpyxkkquzt2rfz908t8yt5vjsdhtegrsasq8us2s6ng5kz7pncupsf",
            "set_price",
            [
                address("resource_tdx_2_1thtxzder4ncupdg47h6zktdnl6p4yqznttv6nuxvzcsntfhthz6m6m"),
                address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"),
                decimal(prices['hug'].toString())
            ]
        )
        .callMethod(
            "component_tdx_2_1cpyxkkquzt2rfz908t8yt5vjsdhtegrsasq8us2s6ng5kz7pncupsf",
            "set_price",
            [
                address("resource_tdx_2_1tkr36auhr7jpn07yvktk3u6s5stcm9vrdgf0xhdym9gv096v4q7thf"),
                address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"),
                decimal(prices['usdc'].toString())
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

    // Setting up the Gateway Sub-APIs that will be used in this example. We will be utilizing two sub
    // APIs: the Status API to get the current epoch and the transaction API to submit and query the
    // status of transactions on the network.
    const apiConfiguration = new Configuration({
        basePath: NetworkConfiguration.gatewayBaseUrl,
    });
    const statusApi = new StatusApi(apiConfiguration);
    const transactionApi = new TransactionApi(apiConfiguration);

    // Setting up the private key of the transaction notary.
    const notaryPrivateKey = new PrivateKey.Ed25519(await generateSecureRandomBytes(32));
    fetchPricesAndSendTransaction(statusApi, transactionApi, notaryPrivateKey);
    setInterval(() => fetchPricesAndSendTransaction(statusApi, transactionApi, notaryPrivateKey), 5 * 60 * 1000); // Every 5 minutes


};

main();