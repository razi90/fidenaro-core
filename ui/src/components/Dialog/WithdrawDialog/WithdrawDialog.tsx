import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Text, Checkbox, Box, Stack, Link, FormControl, FormErrorMessage, useSteps, Divider, Progress, Button, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { USER_NFT_RESOURCE_ADDRESS, fetchUserInfo } from "../../../libs/user/UserDataService";
import { User } from "../../../libs/entities/User";

import ConfirmButton from "../../Button/Dialog/ConfirmButton.tsx/ConfirmButton";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";

import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";
import { Vault } from "../../../libs/entities/Vault";
import { enqueueSnackbar } from "notistack";
import { cancelButtonStyle } from "../../Button/Dialog/CancelButton.tsx/Styled";
import { TruncatedNumberValue } from "../../Text/TruncatedValue";
import { defaultHighlightedLinkButtonStyle } from "../../Button/DefaultHighlightedLinkButton/Styled";

interface WithdrawDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    vault: Vault | undefined
}


const WithdrawDialog: React.FC<WithdrawDialogProps> = ({ isOpen, setIsOpen, vault }) => {

    // Stepper
    const steps = [
        { title: 'First', description: 'Select withdraw amount' },
        { title: 'Second', description: 'Confirm your transaction' },
        { title: 'Third', description: 'Transaction completed' },
    ]

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    })

    const activeStepText = steps[activeStep].description

    // Loading on confirmation
    const [isLoading, setIsLoading] = useState(false);

    const queryClient = useQueryClient();

    // Modal/Dialog close event
    const onClose = () => {
        setIsOpen(false);
        setActiveStep(0);
    }

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
        // mark the action is in loading state
        setIsLoading(true);
        setActiveStep(1);

        // check if name is too short
        if (inputValue.trim().length <= 0) {
            setIsLoading(false);
            setActiveStep(0);
            enqueueSnackbar('Sorry, no withdraw amount is defined.', { variant: 'error' });
            return
        }

        // check if value is 0
        if (parseFloat(inputValue) <= 0) {
            setIsLoading(false);
            setActiveStep(0);
            enqueueSnackbar('Sorry, the amount of the transaction is not valid.', { variant: 'error' });
            return
        }

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

            queryClient.invalidateQueries({ queryKey: ['user_info'] })
            setActiveStep(2);
        }

        if (result.isErr()) {
            enqueueSnackbar(`Failed to withdraw from vault "${vault?.name}"`, { variant: 'error' });
            console.log("Failed to withdraw: ", result.error)

            setActiveStep(0);
        }

        setIsLoading(false);
    };

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" initialFocusRef={initialRef}>
                <ModalOverlay />
                <ModalContent >
                    <ModalHeader>
                        Withdraw
                        <Stack>
                            <Divider />


                            <Text fontSize='md'>
                                Action: <b>{activeStepText}</b>
                            </Text>
                            <Progress
                                borderRadius={7}
                                colorScheme='purple'
                                value={activeStep * 45 + 10}
                                height='10px'
                                width='full'
                                top='10px'

                            />
                        </Stack>


                    </ModalHeader>
                    <ModalCloseButton />

                    {(activeStep == 0 || activeStep == 1) ?
                        (
                            <>
                                <ModalBody>
                                    <Text>You are about to withdraw your position from the vault <b>{vault?.name}</b>.</Text>
                                    <Box my={4}>
                                        <Text>Current shares in the vault <Text as='b'><TruncatedNumberValue content={userShareTokenAmount + ""} /></Text></Text>
                                        <InputGroup>
                                            <InputLeftAddon children="Withdraw" opacity={0.7} />
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
                                        </InputGroup>

                                    </Box>
                                </ModalBody>

                                <ModalFooter>
                                    <Stack>
                                        <Box>
                                            <Checkbox>I confirm that I have read and agreed to the <Link>Terms and Conditions</Link> and fully understand all the associated risks.</Checkbox>
                                        </Box>
                                        <Box display="flex" justifyContent='flex-end'>
                                            <CancelButton onClick={onClose} />

                                            {isLoading ? (
                                                <Button
                                                    isLoading
                                                    loadingText='Confirm on your mobile wallet!'
                                                    sx={defaultHighlightedLinkButtonStyle}
                                                >
                                                    Confirm
                                                </Button >
                                            ) : (
                                                <Button
                                                    sx={defaultHighlightedLinkButtonStyle}
                                                    onClick={deposit}
                                                >
                                                    Confirm
                                                </Button >
                                            )
                                            }
                                        </Box>
                                    </Stack>
                                </ModalFooter>
                            </>
                        ) : (
                            <>
                                <ModalBody>
                                    <Text>You withdrawed successfully the amount of <b>{inputValue}</b> vault shares.</Text>
                                    <Box my={4}>
                                        <Text>Current shares in the vault <Text as='b'><TruncatedNumberValue content={userShareTokenAmount + ""} /></Text></Text>
                                    </Box>
                                </ModalBody>
                                <ModalFooter>
                                    <Stack>
                                        <Box display="flex" justifyContent='flex-end'>
                                            <Button
                                                sx={cancelButtonStyle}
                                                onClick={onClose}
                                            >
                                                Close
                                            </Button >
                                        </Box>
                                    </Stack>
                                </ModalFooter>
                            </>
                        )
                    }
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default WithdrawDialog;