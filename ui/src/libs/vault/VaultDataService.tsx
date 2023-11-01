// import axios from 'axios';
import VaultDataBase from './VaultDataBase.json'

export async function fetchVaultList() {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return VaultDataBase;
    } catch (error) {
        throw error;
    }
}
