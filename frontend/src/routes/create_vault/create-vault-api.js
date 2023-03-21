import {
    RadixDappToolkit,
    ManifestBuilder,
    Decimal,
    ComponentAddress,
    ResourceAddress
} from '@radixdlt/radix-dapp-toolkit'
import { TransactionApi } from "@radixdlt/babylon-gateway-api-sdk";
import { dAppPackageAddress, dAppId, dAppName, radswapPoolComponentAddress } from '../../etc/globals.d';

// Instantiate Gateway SDK
const transactionApi = new TransactionApi();
const rdt = RadixDappToolkit(
    { dAppDefinitionAddress: dAppId, dAppName: dAppName },
    (requestData) => {
        requestData({
            accounts: { quantifier: 'atLeast', quantity: 1 },
        })
    },
    { networkId: 11 }
)
console.log("dApp Toolkit: ", rdt)

const accountAddress = localStorage.getItem('account')
let resourceAddress
let componentAddress

export async function createVauĺt() {

    let manifest = new ManifestBuilder()
        .callMethod(accountAddress, "create_proof", [ResourceAddress("resource_tdx_b_1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq8z96qp")])
        .callFunction(dAppPackageAddress, "TradeVault", "init_trade_vault", [ComponentAddress(accountAddress), Decimal("10"), ComponentAddress(radswapPoolComponentAddress)])
        .build()
        .toString();

    console.log("Instantiate Manifest: ", manifest)

    // Send manifest to extension for signing
    const result = await rdt
        .sendTransaction({
            transactionManifest: manifest,
            version: 1,
        })

    if (result.isErr()) throw result.error

    console.log("Intantiate WalletSDK Result: ", result.value)

    // ************ Fetch the transaction status from the Gateway API ************
    let status = await transactionApi.transactionStatus({
        transactionStatusRequest: {
            intent_hash_hex: result.value.transactionIntentHash
        }
    });
    console.log('Instantiate TransactionApi transaction/status:', status)

    // ************* fetch component address from gateway api and set componentAddress variable **************
    let commitReceipt = await transactionApi.transactionCommittedDetails({
        transactionCommittedDetailsRequest: {
            transaction_identifier: {
                type: 'intent_hash',
                value_hex: result.value.transactionIntentHash
            }
        }
    })
    console.log('Instantiate Committed Details Receipt', commitReceipt)

    // ****** set componentAddress and resourceAddress variables with gateway api commitReciept payload ******
    componentAddress = commitReceipt.details.referenced_global_entities[0]
    console.log(componentAddress)

    resourceAddress = commitReceipt.details.referenced_global_entities[1]
    console.log(resourceAddress)
}