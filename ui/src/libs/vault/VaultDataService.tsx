// import axios from 'axios';
import { Vault, VaultCandleChart, VaultHistory } from '../entities/Vault';
import { componentAddress } from '../fidenaro/Config';
import { rdt } from '../radix-dapp-toolkit/rdt';
import { vaultAssetData } from './VaultAssetData';
import VaultDataBase from './VaultDataBase.json'
import { vaultHistoryData } from './VaultHistoryData';
import { vaultPerformanceCandleChartData } from './VaultPerformanceData';
import { vaultProfitabilityChartData } from './VaultProfitabilityData';


interface Asset {
    name: string;
    resourceAddress: string;
    amount: number;
}


export const fetchVaultList = async (): Promise<Vault[]> => {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        const vaults: Vault[] = VaultDataBase
        const prom = new Promise<Vault[]>((resolve) => {
            resolve(vaults);
        });
        //const prom = new Promise<Vault[]>(vaults)
        return prom

        //const fidenaroComponentLedgerData = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(componentAddress)
        //const tradeVaultComponentAddresses: string[] = getAllTradeVaultAddresses(fidenaroComponentLedgerData)
        //const tradeVaults: Vault[] = getAllTradeVaults(tradeVaultComponentAddresses)
        //return tradeVaults;

    } catch (error) {
        console.log("featchVaultList error.")
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


const getAllTradeVaults = (vaultAddresses: string[]): Vault[] => {
    let tradeVaults: Vault[] = []

    vaultAddresses.forEach(async (address: string) => {

        // fetch data from ledged by the address
        let vaultLedgerData = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(address)
        //let vaultLedgerData = RaziVaultResponse
        //if (address == "component_tdx_2_1crdlauczwswuwh5x9h8trswh9pclty26pvy4lxr99vrvrq7fs9e8jt") {
        //    vaultLedgerData = BitCoinMaxiVaultResponse
        //}
        let name = getMetaData(vaultLedgerData, "name")
        let description = getMetaData(vaultLedgerData, "description")
        let iconUrl = getMetaData(vaultLedgerData, "icon_url")
        let infoUrl = getMetaData(vaultLedgerData, "info_url")
        let fee = getFee(vaultLedgerData)

        // let tradeHistory

        let vault: Vault = {
            vault: name,
            id: address,
            avatar: iconUrl,
            total: 0,
            today: 0,
            activeDays: 0,
            followers: 0,
            equity: 0,
            profitShare: fee,
            pnl: 0,
            manager: '',
            followerList: [],
            tradeHistory: [],
            trades: []
        }


        // let vaultPools: string[] = getResourcePools(vaultData)
        // let assetData = TradeVaultComponent.items.at(0)?.fungible_resources.items
        // let assets: Asset[] = getAssets(vaultPools, assetData)
        tradeVaults.push(vault)
    });

    return tradeVaults
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

const getFee = (vaultLedgerData: any): number => {
    let fee = 0
    vaultLedgerData.details.state.fields.forEach((field: any) => {
        if (field.field_name == "fee") {
            fee = field.value
        }
    })
    return fee;
}

const getResourcePools = (item: any): string[] => {
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

const getAssets = (pools: string[], assetData: any): Asset[] => {
    let assets: Asset[] = []

    assetData.forEach((item: any) => {
        let name = getResourceName(item);
        let address = getResourceAddress(item);
        let amount = getResourceAmount(item);
        if (pools.includes(address)) {
            assets.push({ name, resourceAddress: address, amount })
        }
    })
    return assets;
}

const getResourceName = (item: any): string => {
    return item.explicit_metadata.items.at(0)?.value.typed.value;
}

const getResourceAddress = (item: any): string => {
    return item.resource_address;
}

const getResourceAmount = (item: any): number => {
    return item.vaults.items.at(0)?.amount
}

const getVaultComponentAddress = (vault: any) => {
    return vault.key.value
}

const getManagerBadgeAddress = (vault: any) => {
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
