import { DataRequestBuilder, RadixDappToolkit, RadixNetwork, WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { GatewayApiClient } from '@radixdlt/babylon-gateway-api-sdk'
import { QueryClient } from '@tanstack/react-query';



export const rdt = RadixDappToolkit({
    dAppDefinitionAddress:
        'account_tdx_2_12ygy30qjq3w3gsrmwvm7y4e9y46kn9vyphyd54rd9ljqe63v9k05qe',
    networkId: RadixNetwork.Stokenet,
    applicationName: 'Fidenaro',
    applicationVersion: '0.1.0',
});

export const gatewayApi = GatewayApiClient.initialize(
    rdt.gatewayApi.clientConfig,
)


export const initRadixDappToolkit = (queryClient: QueryClient) => {

    rdt.buttonApi.setTheme('white-with-outline')
    rdt.walletApi.setRequestData(DataRequestBuilder.accounts().atLeast(1))
    // Supscribe to the wallet information in order to recognize connected/disconnected
    rdt.walletApi.walletData$.subscribe((state: any) => {
        // add wallet information to query
        queryClient.setQueryData<WalletDataState>(['wallet_data'], state)
    })
};

