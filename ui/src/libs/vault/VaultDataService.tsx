// import axios from 'axios';
import { Vault } from '../entities/Vault';
import VaultDataBase from './VaultDataBase.json'

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
