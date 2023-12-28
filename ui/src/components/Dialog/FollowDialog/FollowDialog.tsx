import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Text, Checkbox, Box, Stack, Link, FormControl, FormErrorMessage } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { USER_NFT_RESOURCE_ADDRESS, fetchUserInfo } from "../../../libs/user/UserDataService";
import { User } from "../../../libs/entities/User";

import ConfirmButton from "../../Button/Dialog/ConfirmButton.tsx/ConfirmButton";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";

import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";
import { USDollar } from "../../../libs/entities/Asset";
import { Vault } from "../../../libs/entities/Vault";
import { enqueueSnackbar } from "notistack";

interface FollowDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    vault: Vault | undefined
}


const FollowDialog: React.FC<FollowDialogProps> = ({ isOpen, setIsOpen, vault }) => {
    const onClose = () => setIsOpen(false);
    const initialRef = useRef(null)
    const [inputValue, setInputValue] = useState('');
    const [isBalanceError, setIsBalanceError] = useState(false);

    // read user data
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });

    if (isUserFetchError) {
        return <Box>Error loading user data</Box>;
    }

    let userUsdAmount = user?.assets[USDollar.address]

    // balance error handling
    const handleChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;

        //prevent negative values
        if (value < 0) return;

        setInputValue(value);
        setIsBalanceError(Number(value) > userUsdAmount!);
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
                Address("${USDollar.address}")
                Decimal("${inputValue}")
                ;
            TAKE_ALL_FROM_WORKTOP
                Address("${USDollar.address}")
                Bucket("usd")
                ;
            CALL_METHOD
                Address("${vault?.id}")
                "deposit"
                Proof("user_token_proof")
                Bucket("usd")
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
            enqueueSnackbar(`Successfully deposited into vault "${vault?.vault}".`, { variant: 'success' });
            console.log(`Successfully deposited into vault "${vault?.vault}". Value ${result.value}`)
        }

        if (result.isErr()) {
            enqueueSnackbar(`Failed to deposit into vault "${vault?.vault}"`, { variant: 'error' });
            console.log("Failed to deposit: ", result.error)
        }
    };

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" initialFocusRef={initialRef}>
                <ModalOverlay />
                <ModalContent >
                    <ModalHeader>New Following</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>You are about to Follow the Strategy <b>{vault?.vault}</b>. Please note that profit/loss settlements occur only once the Following is stopped or Strategy is closed.</Text>
                        <Box my={4}>
                            <Text>Wallet balance {userUsdAmount} USD</Text>
                            <Text><b>Deposit</b></Text>
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
                        {/* <Box my={4}>
                            <Text>Your profit share: {100 - vault?.profitShare}%</Text>
                        </Box> */}
                        <Box my={4} color="orange.400">
                            <Text>⚠️ Please be informed that following a strategy using Covesting Copy-trading Module involves risk of capital loss. Following a strategy could result in a partial or complete loss of your funds, therefore, you should not operate with funds you cannot afford to lose.</Text>
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

export default FollowDialog;