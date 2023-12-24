import { DataRequestBuilder, RadixDappToolkit, RadixNetwork, WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchConnectedWallet } from '../wallet/WalletDataService';
//import UserAccountResponse from './UserAccountResponse.json';

//export const USER_NFT_RESOURCE_ADDRESS = "resource_tdx_2_1n2tw2nl3hjak8kyxv5reslrahrdqdu2qhhn839stjgtlrh40utt0zp"



export const rdt = RadixDappToolkit({
    dAppDefinitionAddress:
        'account_tdx_2_12xmwv55ap2n25uzl9hywpu7ytyzhp9gl6zc9fnz3rssj40nv8pqmkn',
    networkId: RadixNetwork.Stokenet,
    applicationName: 'Fidenaro',
    applicationVersion: '0.1.0',
});


export const initRadixDappToolkit = (queryClient: QueryClient) => {

    rdt.buttonApi.setTheme('white-with-outline')
    rdt.walletApi.setRequestData(DataRequestBuilder.accounts().atLeast(1))
    // Supscribe to the wallet information in order to recognize connected/disconnected
    rdt.walletApi.walletData$.subscribe((state: any) => {

        // add wallet information to query
        queryClient.setQueryData<WalletDataState>(['wallet_data'], state)

        //const { data: wallet, isWalletError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    })
};


/*
export let ACCOUNT_ADDRESS: string
export let USER_ID: string

function onAccountAddressSet(callback: () => void) {
    rdt.walletApi.setRequestData(DataRequestBuilder.accounts().atLeast(1))
    rdt.walletApi.walletData$.subscribe((walletData) => {
        ACCOUNT_ADDRESS = walletData.accounts[0].address;
        callback();
    });
}

onAccountAddressSet(async () => {
    // let userLedgerData = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(ACCOUNT_ADDRESS);
    let userLedgerData = UserAccountResponse
    USER_ID = getId(userLedgerData)
});


function getId(userLedgerData: any): string {
    let id = "N/A"

    userLedgerData.non_fungible_resources.items.forEach((item: any) => {
        if (item.resource_address == USER_NFT_RESOURCE_ADDRESS) {
            id = item.vaults.items.at(0).items.at(0)
        }
    });

    return id;
}
*/

