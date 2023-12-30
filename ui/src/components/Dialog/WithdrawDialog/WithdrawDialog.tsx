import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Text, Checkbox, Box, Stack, Link, FormControl, FormErrorMessage } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { USER_NFT_RESOURCE_ADDRESS, fetchUserInfo } from "../../../libs/user/UserDataService";
import { User } from "../../../libs/entities/User";

import ConfirmButton from "../../Button/Dialog/ConfirmButton.tsx/ConfirmButton";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";

import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";
import { Vault } from "../../../libs/entities/Vault";
import { enqueueSnackbar } from "notistack";

interface WithdrawDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    vault: Vault | undefined
}


const WithdrawDialog: React.FC<WithdrawDialogProps> = ({ isOpen, setIsOpen, vault }) => {
    const onClose = () => setIsOpen(false);
    const initialRef = useRef(null)
    const [inputValue, setInputValue] = useState('');
    const [isBalanceError, setIsBalanceError] = useState(false);

    // read user data
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });

    if (isUserFetchError) {
        return <Box>Error loading user data</Box>;
    }

    const userShareTokenAmount = vault ? user?.assets.get(vault.share_token_address) ?? 0 : 0;

    // balance error handling
    const handleChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;

        //prevent negative values
        if (value < 0) return;

        setInputValue(value);
        setIsBalanceError(Number(value) > userShareTokenAmount!);
    };

    const deposit = async () => {
        // build manifast to create a trade vault
        let manifest = `
            CALL_METHOD
                Address("${user?.account}")
                "withdraw"
                Address("${USER_NFT_RESOURCE_ADDRESS}")
                Decimal("1")
                ;
            TAKE_ALL_FROM_WORKTOP
                Address("${USER_NFT_RESOURCE_ADDRESS}")
                Bucket("user_token")
                ;
            CREATE_PROOF_FROM_BUCKET_OF_NON_FUNGIBLES
                Bucket("user_token")
                Array<NonFungibleLocalId>(NonFungibleLocalId("${user?.id}"))
                Proof("user_token_proof")
                ;
            CALL_METHOD
                Address("${user?.account}")
                "withdraw"
                Address("${vault?.share_token_address}")
                Decimal("${inputValue}")
                ;
            TAKE_ALL_FROM_WORKTOP
                Address("${vault?.share_token_address}")
                Bucket("shares")
                ;
            CALL_METHOD
                Address("${vault?.id}")
                "withdraw"
                Proof("user_token_proof")
                Bucket("shares")
                ;
            RETURN_TO_WORKTOP
                Bucket("user_token");
            CALL_METHOD
                Address("${user?.account}")
                "deposit_batch"
                Expression("ENTIRE_WORKTOP")
                ;
            `

        console.log('deposit manifest: ', manifest)

        // send manifast to extension for signing
        const result = await rdt.walletApi
            .sendTransaction({
                transactionManifest: manifest,
                version: 1,
            })

        if (result.isOk()) {
            enqueueSnackbar(`Successfully withdrew from vault "${vault?.name}".`, { variant: 'success' });
            console.log(`Successfully withdrew from vault "${vault?.name}". Value ${result.value}`)
        }

        if (result.isErr()) {
            enqueueSnackbar(`Failed to withdraw from vault "${vault?.name}"`, { variant: 'error' });
            console.log("Failed to withdraw: ", result.error)
        }
    };

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" initialFocusRef={initialRef}>
                <ModalOverlay />
                <ModalContent >
                    <ModalHeader>Withdraw</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>You are about to withdraw your position from the vault <b>{vault?.name}</b>.</Text>
                        <Box my={4}>
                            <Text>Wallet balance {userShareTokenAmount} vault shares</Text>
                            <Text><b>Withdraw</b></Text>
                            <FormControl isInvalid={isBalanceError}>
                                <Input
                                    ref={initialRef}
                                    placeholder="0"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={inputValue}
                                    onChange={handleChange}
                                />
                                {isBalanceError && (
                                    <FormErrorMessage>Insufficient funds</FormErrorMessage>
                                )}
                            </FormControl>

                        </Box>
                    </ModalBody>

                    <ModalFooter>
                        <Stack>
                            <Box>
                                <Checkbox>I confirm that I have read and agreed to the <Link>Terms and Conditions</Link> and fully understand all the associated risks.</Checkbox>
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="center">
                                <CancelButton onClick={onClose} />
                                <ConfirmButton onClick={deposit} />
                            </Box>
                        </Stack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default WithdrawDialog;