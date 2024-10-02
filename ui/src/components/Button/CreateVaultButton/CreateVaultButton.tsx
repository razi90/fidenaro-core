import { Box, Button, Tooltip } from '@chakra-ui/react';
import { topNavigationButtonStyle } from './Styled';
import { FaPlus } from 'react-icons/fa';
import { DataRequestBuilder } from '@radixdlt/radix-dapp-toolkit';
import { rdt } from '../../../libs/radix-dapp-toolkit/rdt'
import { useQuery } from '@tanstack/react-query';
import { User } from '../../../libs/entities/User';
import { fetchUserInfo } from '../../../libs/user/UserDataService';


let componentAddress = "component_tdx_2_1cqkpmaerr2qhkgyjr935g8hdls3x324cm24kvzvh25607kaxgf47r9"

const CreateVaultButton: React.FC = () => {

    // read user data
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });

    const createVault = async () => {
        // build manifest to create a trade vault
        let manifest = `
            CALL_METHOD
                Address("${componentAddress}")
                "new_vault"
                "Bitcoin Maxis Only"
                Decimal("10")
                "I only buy Bitcoin."
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1280px-Bitcoin.svg.png"
                "https://en.wikipedia.org/wiki/Bitcoin";
            CALL_METHOD
                Address("${user?.account}")
                "deposit_batch"
                Expression("ENTIRE_WORKTOP");`

        console.log('new_vault manifest: ', manifest)

        // send manifest to extension for signing
        const result = await rdt.walletApi
            .sendTransaction({
                transactionManifest: manifest,
                version: 1,
            })

        // if (result.isErr()) throw result.error
        // console.log("Intantiate WalletSDK Result: ", result.value)
    };

    return (
        <Tooltip label='Create Vault'>
            <Button
                onClick={createVault}
                sx={topNavigationButtonStyle}
                title="Create Vault"
            >
                <FaPlus />
            </Button>
        </Tooltip>
    );
};

export default CreateVaultButton;