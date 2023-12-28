import { DataRequestBuilder, RadixDappToolkit, RadixNetwork, WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchConnectedWallet } from '../wallet/WalletDataService';
import UserAccountResponse from './UserAccountResponse.json';



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
    })
};

