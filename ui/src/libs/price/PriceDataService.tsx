import { Bitcoin, Ethereum, USDollar } from "../entities/Asset";
import { rdt } from "../radix-dapp-toolkit/rdt";

export const fetchPriceList = async (): Promise<Map<string, number>> => {
    try {
        const tokens = [Ethereum, Bitcoin];
        const priceMap = new Map<string, number>();
        for (const token of tokens) {
            let poolData = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(token.pool_address)
            priceMap.set(token.address, calculatePrice(poolData));
        }
        priceMap.set(USDollar.address, 1)
        return priceMap;
    } catch (error) {
        console.log("Error fetching price data.")
        throw error;
    }
}

function calculatePrice(data: any): number {
    const dollarAddress = USDollar.address;
    const resources = data.fungible_resources.items;
    const dollarResource = resources.find((item: { resource_address: any; }) => item.resource_address === dollarAddress);
    const otherResource = resources.find((item: { resource_address: any; }) => item.resource_address !== dollarAddress);

    const dollarAmount = parseFloat(dollarResource.vaults.items[0].amount);
    const otherAmount = parseFloat(otherResource.vaults.items[0].amount);

    return dollarAmount / otherAmount;
}