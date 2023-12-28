import { Box, Button } from '@chakra-ui/react';
import { swapButtonStyle } from './Styled';
import { DataRequestBuilder } from '@radixdlt/radix-dapp-toolkit';
import { rdt } from '../../../libs/radix-dapp-toolkit/rdt';
import { useQuery } from '@tanstack/react-query';
import { User } from '../../../libs/entities/User';
import { fetchUserInfo } from '../../../libs/user/UserDataService';


let componentAddress = "component_tdx_2_1cplgxw6675ss8atu5l8rm2pq77flpqn93aqjl99rveqtnw7w253s0t"
let usdResource = "resource_tdx_2_1tkk467s802k4r44jltc5c5np7e53lurekcs2cxu5jja5xcs7mk64ld"
let poolAddress = "component_tdx_2_1cqwaea9esxdung38xuc67pdxvss0refpahnjmuk05jqaphcycse79j"



const CreateVaultButton: React.FC = () => {

    // read user data
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });

    if (isUserFetchError) {
        return <Box>Error loading user data</Box>;
    }

    const swap = async () => {
        // build manifast to create a trade vault
        let manifest = `
            CALL_METHOD
                Address("${user?.account}")
                "create_proof_of_amount"
                Address("resource_tdx_2_1tkf6sf86cc7wp57758cyfaea9thmmt3t8qg5n9zcw6qwdg9mdqf4pl")
                Decimal("1");
            CALL_METHOD
                Address("${componentAddress}")
                "swap"
                Address("${usdResource}")
                Decimal("50")
                Address("${poolAddress}");
            CALL_METHOD
                Address("${user?.account}")
                "deposit_batch"
                Expression("ENTIRE_WORKTOP");`

        console.log('swap manifest: ', manifest)

        // send manifast to extension for signing
        const result = await rdt.walletApi
            .sendTransaction({
                transactionManifest: manifest,
                version: 1,
            })

        // if (result.isErr()) throw result.error
        // console.log("Intantiate WalletSDK Result: ", result.value)
    };

    return (
        <Button
            onClick={swap}
            sx={swapButtonStyle}
            size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
        >
            Swap
        </Button>
    );
};

export default CreateVaultButton;