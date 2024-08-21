import { StateKeyValueStoreDataRequest, StateKeyValueStoreDataRequestKeyItem } from "@radixdlt/babylon-gateway-api-sdk";
import { Bitcoin, Ethereum, USDollar, Hug, Radix, Asset } from "../entities/Asset";
import { PRICE_STORE } from "../fidenaro/Config";
import { gatewayApi, rdt } from "../radix-dapp-toolkit/rdt";

export interface PriceData {
    priceInXRD: number;
    priceInUSD: number;
}

export const fetchPriceList = async (): Promise<Map<string, PriceData>> => {
    try {
        const tokens = [Ethereum, Bitcoin, Hug, USDollar, Radix];
        const priceMap = await fetchPricesFromKeyValueStore(tokens);

        return priceMap;
    } catch (error) {
        console.log("Error fetching price data.");
        throw error;
    }
}

async function fetchPricesFromKeyValueStore(tokens: Asset[]): Promise<Map<string, PriceData>> {
    let priceMap = new Map<string, PriceData>();

    // Map tokens to an array of StateKeyValueStoreDataRequestKeyItem objects
    const keys = tokens.map(token => ({
        key_hex: token.price_key
    }));

    // Define the StateKeyValueStoreDataRequest object
    const stateKeyValueStoreDataRequest: StateKeyValueStoreDataRequest = {
        key_value_store_address: PRICE_STORE,
        keys: keys
    };

    // Now make the API call with the constructed request object
    let oracleLedgerData = await gatewayApi.state.innerClient.keyValueStoreData({
        stateKeyValueStoreDataRequest: stateKeyValueStoreDataRequest
    });

    // Handle XRD price
    let priceData: PriceData = {
        priceInXRD: 1,
        priceInUSD: 0
    }
    priceMap.set(Radix.address, priceData);

    // Iterate over the entries array
    oracleLedgerData.entries.forEach((entry: any) => {
        // Extract the base ResourceAddress and price from the entry
        const baseResourceAddress = entry.key.programmatic_json.fields.find(
            (field: any) => field.field_name === "base"
        )?.value;

        const price = entry.value.programmatic_json.fields.find(
            (field: any) => field.field_name === "price"
        )?.value;

        if (baseResourceAddress && price) {
            let priceData: PriceData = {
                priceInXRD: 0,
                priceInUSD: 0
            }
            if (baseResourceAddress === USDollar.address) {
                priceData.priceInXRD = parseFloat(price);
                priceData.priceInUSD = 1
            } else {
                priceData.priceInXRD = parseFloat(price)
            }

            priceMap.set(baseResourceAddress, priceData);
        }


    });

    priceMap = calculatePricesInUSD(priceMap);

    return priceMap

}

function calculatePricesInUSD(priceMap: Map<string, PriceData>): Map<string, PriceData> {
    // get xUSDC price in XRD
    const xUSDCPriceInXRD = priceMap.get(USDollar.address)?.priceInXRD;
    const XRDPriceinUSD = 1 / xUSDCPriceInXRD!;
    priceMap.forEach((price, resourceAddress) => {
        if (resourceAddress == Radix.address) {
            price.priceInUSD = XRDPriceinUSD
        } else {
            if (resourceAddress !== USDollar.address) {
                price.priceInUSD = price.priceInXRD * XRDPriceinUSD;
            }
        }
    });

    return priceMap;
}