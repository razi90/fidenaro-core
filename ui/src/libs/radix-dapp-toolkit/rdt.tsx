import { DataRequestBuilder, RadixDappToolkit, RadixNetwork, WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchConnectedWallet } from '../wallet/WalletDataService';



export const rdt = RadixDappToolkit({
    dAppDefinitionAddress:
        'account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj',
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

