import { Trade, TradeAction, Vault, VaultCandleChart, VaultHistory } from '../entities/Vault';
import { vaultAssetData } from './VaultAssetData';
import { vaultHistoryData } from './VaultHistoryData';
import { vaultPerformanceCandleChartData } from './VaultPerformanceData';
import { vaultProfitabilityChartData } from './VaultProfitabilityData';
import { Asset, AssetMap, addressToAsset } from '../entities/Asset';
import { rdt } from '../radix-dapp-toolkit/rdt';
import { FidenaroComponentAddress } from '../fidenaro/Config';
import { fetchUserInfoById } from '../user/UserDataService';

export const fetchVaultList = async (): Promise<Vault[]> => {
    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        let tradeVaults: Vault[] = []
        let fidenaroComponentLedgerData = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(FidenaroComponentAddress)
        let tradeVaultComponentAddresses: string[] = getAllTradeVaultAddresses(fidenaroComponentLedgerData)
        for (const address of tradeVaultComponentAddresses) {
            let vault = await getVaultById(address);
            tradeVaults.push(vault);
        }
        return tradeVaults;
    } catch (error) {
        console.log("fetchVaultList error.")
        throw error;
    }
}

export const getVaultById = async (address: string): Promise<Vault> => {
    try {

        // fetch data from ledged by the address
        let vaultLedgerData: any = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(address)
        let name = getMetaData(vaultLedgerData, "name")
        let description = getMetaData(vaultLedgerData, "description")

        let vault_fields = vaultLedgerData.details.state.fields
        let share_token_address = getFieldValueByKey(vault_fields, "share_token_manager")
        let manager_badge_address = getFieldValueByKey(vault_fields, "fund_manager_badge")
        let fee = parseFloat(getFieldValueByKey(vault_fields, "fee"))

        let followers = getFollowerIds(vault_fields)

        let trades = getTrades(vault_fields)

        let assets = getAssets(vaultLedgerData.fungible_resources.items)

        let manager_id = getFieldValueByKey(vault_fields, "manager_user_id")
        let manager = await fetchUserInfoById(manager_id);

        let vault: Vault = {
            name: name,
            id: address,
            description,
            share_token_address,
            manager_badge_address,
            total: 0,
            today: 0,
            activeDays: 0,
            followers: followers,
            equity: 0,
            profitShare: fee,
            pnl: 0,
            manager,
            followerList: [],
            tradeHistory: trades,
            assets
        }

        return vault
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

const getAllTradeVaultAddresses = (fidenaroComponentLedgerData: any): string[] => {
    let componentAddresses: string[] = []
    fidenaroComponentLedgerData.details.state.fields.forEach((field: any) => {
        if (field.field_name == "vaults") {
            field.entries.forEach((vault: any) => {
                componentAddresses.push(getVaultComponentAddress(vault))
            })
        }
    });

    return componentAddresses
}

const getMetaData = (vaultLedgerData: any, key: string): string => {
    let metaData = 'N/A'
    vaultLedgerData.metadata.items.forEach((item: any) => {
        if (item.key == key) {
            metaData = item.value.programmatic_json.fields.at(0).value;
        }
    });
    return metaData
}

function getTrades(vault_fields: any): Trade[] {
    let trades: Trade[] = []
    vault_fields.forEach((field: any) => {
        if (field.field_name == "trades") {
            field.elements.forEach((element: any) => {

                let epoch: number = parseInt(getFieldValueByKey(element.fields, "epoch"));
                let timestamp: string = formatUnixTimestampToUTC(parseInt(getFieldValueByKey(element.fields, "timestamp")));
                let action: TradeAction = stringToTradeAction(getFieldVariantNameByKey(element.fields, "trade_action"));
                let from: Asset = addressToAsset(getFieldValueByKey(element.fields, "from"));
                let from_amount: number = parseFloat(getFieldValueByKey(element.fields, "from_amount"));
                let to: Asset = addressToAsset(getFieldValueByKey(element.fields, "to"));
                let to_amount: number = parseFloat(getFieldValueByKey(element.fields, "to_amount"));
                let price: number = parseFloat(getFieldValueByKey(element.fields, "price"));

                let trade: Trade = {
                    epoch,
                    timestamp,
                    action,
                    from,
                    from_amount,
                    to,
                    to_amount,
                    price
                }
                trades.push(trade)
            })
        }
    })
    return trades;
}

function formatUnixTimestampToUTC(timestamp: number): string {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return date.toISOString().replace('T', ' ').substr(0, 19) + ' UTC';
}

function getAssets(ledgerAssetData: any): AssetMap {
    let assets: AssetMap = {}

    for (const asset_item of ledgerAssetData) {
        let asset = addressToAsset(asset_item.resource_address)
        let amount = asset_item.vaults.items[0].amount
        if (amount != 0) { // Ignore entry for the share token of the vault
            assets[asset.address] = amount
        }
    }

    return assets
}

function stringToTradeAction(value: string): TradeAction {
    switch (value) {
        case "Buy":
            return TradeAction.Buy;
        case "Sell":
            return TradeAction.Sell;
        default:
            return TradeAction.Default;
    }
}

function getFieldValueByKey(fields: any, key: string): string {
    let fieldValue = 'N/A'

    for (const field of fields) {
        if (field.field_name == key) {
            fieldValue = field.value
            break;
        }
    }
    return fieldValue
}

function getFieldVariantNameByKey(fields: any, key: string): string {
    let variantName = 'Default'
    fields.forEach((field: any) => {
        if (field.field_name == key) {
            variantName = field.variant_name
        }
    })
    return variantName
}

function getFollowerIds(follower_field: any): string[] {
    let followers: string[] = []
    follower_field.forEach((field: any) => {
        if (field.field_name == "followers") {
            field.entries.forEach((entry: any) => {
                followers.push(entry.key.value)
            })
        }
    })
    return followers;
}

function getResourcePools(item: any): string[] {
    let pools: string[] = []

    item.forEach((field: any) => {
        if (field.field_name == "pools") {
            field.entries.forEach((entry: any) => {
                pools.push(entry.key.value)
            })
        }
    })

    return pools;
}


function getResourceName(item: any): string {
    return item.explicit_metadata.items.at(0)?.value.typed.value;
}

function getResourceAddress(item: any): string {
    return item.resource_address;
}

function getResourceAmount(item: any): number {
    return item.vaults.items.at(0)?.amount
}

function getVaultComponentAddress(vault: any) {
    return vault.key.value
}

function getManagerBadgeAddress(vault: any) {
    let address = vault.value.fields.at(0).value
    return address
}

const getShareTokenAddress = (vault: any) => {
    let address = vault.value.fields.at(1).value
    return address
}




/* Dummy Functions have to be replaced by original data */

export const fetchVaultPerformanceSeries = async () => {
    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        //const candleChartData: VaultCandleChart[] = vaultPerformanceCandleChartData
        return vaultPerformanceCandleChartData;
    } catch (error) {
        throw error;
    }
}




export const fetchVaultFollowerChartData = async () => {

    const vaultFollowerChartData = [
        {
            name: 'X',
            data: [0, 1, 1, 1, 2, 3, 3, 3, 4, 3, 3, 4, 5, 6, 7, 7, 7, 7, 6, 7, 7, 7, 7],
        },
    ];


    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return vaultFollowerChartData;
    } catch (error) {
        throw error;
    }
}

export const fetchVaultTotalChartData = async () => {

    const vaultTotalChartData = [
        {
            name: 'X',
            data: [30, 3, 40, 45, 50, 49, 60, 70, 91, 80, 50, 30, 25, 20, 17, 40],
        },
    ];


    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return vaultTotalChartData;
    } catch (error) {
        throw error;
    }
}

export const fetchVaultTodayChartData = async () => {

    const vaultTodayChartData = [
        {
            name: 'X',
            data: [17, 16, 18, 20, 23, 28, 31, 37, 37, 34, 39, 39, 37, 40, 40, 40],
        },
    ];


    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return vaultTodayChartData;
    } catch (error) {
        throw error;
    }
}

export const fetchVaultDummyChartData = async () => {

    const vaultDummyChartData = [
        {
            name: 'X',
            data: [30, 0, 40, 45, 50, 49, 60, 70, 91, 80, 50, 30, 25, 20, 24, 40],
        },
    ];


    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return vaultDummyChartData;
    } catch (error) {
        throw error;
    }
}

export const fetchVaultProfitabilityData = async () => {
    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return vaultProfitabilityChartData;
    } catch (error) {
        throw error;
    }
}

export const fetchVaultHistoryData = async () => {
    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return vaultHistoryData as VaultHistory[];
    } catch (error) {
        throw error;
    }
}

export const fetchVaultAssetData = async () => {
    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return vaultAssetData;
    } catch (error) {
        throw error;
    }
}
