import { RadixDappToolkit, RadixNetwork } from '@radixdlt/radix-dapp-toolkit';

const rdt = RadixDappToolkit({
    dAppDefinitionAddress:
        'account_tdx_e_128k7w3hfh5kl5j7vwc06s4vz3revfrpmwurqt9pea2fq4t4p3z9smh',
    networkId: RadixNetwork.RCnetV3,
    applicationName: 'Fidenaro',
    applicationVersion: '1.0.0',
});

export default rdt;
