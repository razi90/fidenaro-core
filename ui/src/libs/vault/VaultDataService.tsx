import { Trade, TradeAction, Vault, VaultCandleChart, VaultHistory } from '../entities/Vault';
import { vaultAssetData } from './VaultAssetData';
import { vaultHistoryData } from './VaultHistoryData';
import { vaultPerformanceCandleChartData } from './VaultPerformanceData';
import { vaultProfitabilityChartData } from './VaultProfitabilityData';

import { Asset, addressToAsset } from '../entities/Asset';
import { rdt } from '../radix-dapp-toolkit/rdt';
import { User } from '../entities/User';
import { useQuery } from '@tanstack/react-query';

const FidenaroComponentAddress: string = "component_tdx_2_1cqkpmaerr2qhkgyjr935g8hdls3x324cm24kvzvh25607kaxgf47r9"

export const fetchVaultList = async (): Promise<Vault[]> => {
    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        let tradeVaults: Vault[] = []
        let fidenaroComponentLedgerData = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(FidenaroComponentAddress)
        // let fidenaroComponentLedgerData = FidenaroResponse
        let tradeVaultComponentAddresses: string[] = getAllTradeVaultAddresses(fidenaroComponentLedgerData)
        for (const address of tradeVaultComponentAddresses) {
            let vault = await getVaultById(address);
            tradeVaults.push(vault);
        }
        // let tradeVaults = getAllTradeVaults(tradeVaultComponentAddresses)
        // await new Promise((resolve) => setTimeout(resolve, 200)); // Delay for simulation
        return tradeVaults;
    } catch (error) {
        console.log("featchVaultList error.")
        throw error;
    }
}

export const getVaultById = async (address: string): Promise<Vault> => {
    try {

        // fetch data from ledged by the address
        let vaultLedgerData = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(address)
        // let vaultLedgerData = RaziVaultResponse
        // if (address == "component_tdx_2_1crdlauczwswuwh5x9h8trswh9pclty26pvy4lxr99vrvrq7fs9e8jt") {
        //     vaultLedgerData = BitCoinMaxiVaultResponse
        // }
        let name = getMetaData(vaultLedgerData, "name")
        let description = getMetaData(vaultLedgerData, "description")

        // let vault_fields = vaultLedgerData.details?.state.fields
        let fee = parseFloat(getFieldValueByKey(vaultLedgerData, "fee"))

        // let manager_id = getFieldValueByKey(vault_fields, "manager_user_id")
        // let manager = await fetchUserInfoById(manager_id);

        // let followers = getFollowerIds(vault_fields)
        let followers: string[] = []

        // let trades = getTrades(vault_fields)
        let trades: Trade[] = []

        let manager: User = {
            account: "N/A",
            persona: "N/A",
            id: "#0#",
            name: "BearosSnap",
            bio: "Best trader in the world.",
            avatar: "https://pbs.twimg.com/profile_images/1723034496251953152/w9qqFj0F_400x400.jpg",
            twitter: "ThanosOfCrypto",
            telegram: "my_telegram",
            discord: "N/A"
        }

        let vault: Vault = {
            vault: name,
            id: address,
            description,
            total: 0,
            today: 0,
            activeDays: 0,
            followers: followers,
            equity: 0,
            profitShare: fee,
            pnl: 0,
            manager,
            followerList: [],
            tradeHistory: trades
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


const getAllTradeVaults = async (vaultAddresses: string[]): Promise<Vault[]> => {
    let tradeVaults: Vault[] = []

    try {

        vaultAddresses.forEach(async (address: string) => {

            // fetch data from ledged by the address
            let vaultLedgerData = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(address)
            // let vaultLedgerData = RaziVaultResponse
            // if (address == "component_tdx_2_1crdlauczwswuwh5x9h8trswh9pclty26pvy4lxr99vrvrq7fs9e8jt") {
            //     vaultLedgerData = BitCoinMaxiVaultResponse
            // }
            let name = getMetaData(vaultLedgerData, "name")
            let description = getMetaData(vaultLedgerData, "description")

            // let vault_fields = vaultLedgerData.details?.state.fields
            let fee = parseFloat(getFieldValueByKey(vaultLedgerData, "fee"))

            // let manager_id = getFieldValueByKey(vault_fields, "manager_user_id")
            // let manager = await fetchUserInfoById(manager_id);

            // let followers = getFollowerIds(vault_fields)
            let followers: string[] = []

            // let trades = getTrades(vault_fields)
            let trades: Trade[] = []

            let manager: User = {
                account: "N/A",
                persona: "N/A",
                id: "#0#",
                name: "BearosSnap",
                bio: "Best trader in the world.",
                avatar: "https://pbs.twimg.com/profile_images/1723034496251953152/w9qqFj0F_400x400.jpg",
                twitter: "ThanosOfCrypto",
                telegram: "my_telegram",
                discord: "N/A"
            }

            let vault: Vault = {
                vault: name,
                id: address,
                description,
                total: 0,
                today: 0,
                activeDays: 0,
                followers: followers,
                equity: 0,
                profitShare: fee,
                pnl: 0,
                manager,
                followerList: [],
                tradeHistory: trades
            }

            // let vaultPools: string[] = getResourcePools(vaultData)
            // let assetData = TradeVaultComponent.items.at(0)?.fungible_resources.items
            // let assets: Asset[] = getAssets(vaultPools, assetData)
            tradeVaults.push(vault)
        });
        return tradeVaults
    } catch (error) {
        console.log("featchVaultList error.")
        throw error;
    }

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
                let action: TradeAction = stringToTradeAction(getFieldVariantNameByKey(element.fields, "trade_action"));
                let from: Asset = addressToAsset(getFieldValueByKey(element.fields, "from"));
                let from_amount: number = parseFloat(getFieldValueByKey(element.fields, "from_amount"));
                let to: Asset = addressToAsset(getFieldValueByKey(element.fields, "to"));
                let to_amount: number = parseFloat(getFieldValueByKey(element.fields, "to_amount"));
                let price: number = parseFloat(getFieldValueByKey(element.fields, "price"));
                let trade: Trade = {
                    epoch,
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

function getFieldValueByKey(ladger_data: any, key: string): string {
    let fieldValue = 'N/A'
    ladger_data.details.state.fields.forEach((field: any) => {
        if (field.field_name == key) {
            fieldValue = field.value
        }
    })
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
            field.elements.forEach((element: any) => {
                followers.push(element.value)
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
