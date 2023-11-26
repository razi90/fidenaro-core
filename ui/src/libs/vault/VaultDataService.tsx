// import axios from 'axios';
import { Vault, VaultCandleChart, VaultHistory } from '../entities/Vault';
import { vaultAssetData } from './VaultAssetData';
import VaultDataBase from './VaultDataBase.json'
import { vaultHistoryData } from './VaultHistoryData';
import { vaultPerformanceCandleChartData } from './VaultPerformanceData';
import { vaultProfitabilityChartData } from './VaultProfitabilityData';


export async function fetchVaultList() {
    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        const vaults: Vault[] = VaultDataBase
        return vaults;
    } catch (error) {
        throw error;
    }
}

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
