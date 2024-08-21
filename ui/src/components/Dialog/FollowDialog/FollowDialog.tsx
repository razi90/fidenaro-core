import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Text, Checkbox, Box, Stack, Link, FormControl, FormErrorMessage, useSteps, Divider, Progress, Button, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { fetchUserInfo } from "../../../libs/user/UserDataService";
import { User } from "../../../libs/entities/User";

import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";

import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";
import { Radix, USDollar } from "../../../libs/entities/Asset";
import { Vault } from "../../../libs/entities/Vault";
import { enqueueSnackbar } from "notistack";
import { defaultHighlightedLinkButtonStyle } from "../../Button/DefaultHighlightedLinkButton/Styled";
import { cancelButtonStyle } from "../../Button/Dialog/CancelButton.tsx/Styled";
import { TruncatedNumberValue } from "../../Text/TruncatedValue";
import { USER_NFT_RESOURCE_ADDRESS } from "../../../libs/fidenaro/Config";
import { ManifestBuilder, address, array, ValueKind, nonFungibleLocalId, proof, expression, enumeration, RadixEngineToolkit, NetworkId, decimal, bucket } from "@radixdlt/radix-engine-toolkit";




interface FollowDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    vault: Vault | undefined
}


const FollowDialog: React.FC<FollowDialogProps> = ({ isOpen, setIsOpen, vault }) => {

    // Stepper
    const steps = [
        { title: 'First', description: 'Select deposit amount' },
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

    // Modal
    const initialRef = useRef(null)
    const [inputValue, setInputValue] = useState('');
    const [isBalanceError, setIsBalanceError] = useState(false);
    const onClose = () => {
        setIsOpen(false);
        setActiveStep(0);

    }

    const queryClient = useQueryClient();
    // read user data
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });

    if (isUserFetchError) {
        return <Box>Error loading user data</Box>;
    }

    let userUsdAmount = user?.assets.get(Radix.address) ?? 0;

    // balance error handling
    const handleChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;

        //prevent negative values
        if (value < 0) return;

        setInputValue(value);
        setIsBalanceError(Number(value) > userUsdAmount!);
    };


    const deposit = async () => {

        // mark the action is in loading state
        setIsLoading(true);
        setActiveStep(1);

        // check if name is too short
        if (inputValue.trim().length <= 0) {
            setIsLoading(false);
            setActiveStep(0);
            enqueueSnackbar('Sorry, no deposit amount is defined.', { variant: 'error' });
            return
        }

        // check if value is 0
        if (parseFloat(inputValue) <= 0) {
            setIsLoading(false);
            setActiveStep(0);
            enqueueSnackbar('Sorry, the amount of the transaction is not valid.', { variant: 'error' });
            return
        }

        // build manifest to deposit into a vault
        let transactionManifest = new ManifestBuilder()
            .callMethod(
                user?.account!,
                "withdraw",
                [
                    address(Radix.address),
                    decimal(inputValue)
                ]
            )
            .callMethod(
                user?.account!,
                "create_proof_of_non_fungibles",
                [
                    address(
                        USER_NFT_RESOURCE_ADDRESS
                    ),
                    array(ValueKind.NonFungibleLocalId, nonFungibleLocalId(user?.id!)),
                ]
            )
            .createProofFromAuthZoneOfNonFungibles(
                USER_NFT_RESOURCE_ADDRESS,
                [user?.id!],
                (builder, proofId) => builder.takeAllFromWorktop(
                    Radix.address,
                    (builder, bucketId) => builder.callMethod(
                        vault?.id!,
                        "deposit",
                        [
                            proof(proofId),
                            bucket(bucketId)
                        ]
                    )
                )
            )
            .callMethod(
                user?.account!,
                "try_deposit_batch_or_abort",
                [
                    expression("EntireWorktop"),
                    enumeration(0)
                ]
            )
            .build();

        let convertedInstructions = await RadixEngineToolkit.Instructions.convert(
            transactionManifest.instructions,
            NetworkId.Stokenet,
            "String"
        );

        console.log('deposit manifest: ', convertedInstructions.value)

        // send manifest to extension for signing
        const result = await rdt.walletApi
            .sendTransaction({
                transactionManifest: convertedInstructions.value.toString(),
                version: 1,
            })

        if (result.isOk()) {
            enqueueSnackbar(`Successfully deposited into vault "${vault?.name}".`, { variant: 'success' });
            console.log(`Successfully deposited into vault "${vault?.name}". Value ${result.value}`)

            queryClient.invalidateQueries({ queryKey: ['user_info'] })
            setActiveStep(2);
        }

        if (result.isErr()) {
            enqueueSnackbar(`Failed to deposit into vault "${vault?.name}"`, { variant: 'error' });
            console.log("Failed to deposit: ", result.error)
            setActiveStep(0);

        }

        setIsLoading(false);
    };

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" initialFocusRef={initialRef}>
                <ModalOverlay />
                <ModalContent >
                    <ModalHeader>New Following
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
                                    <Text>You are about to Follow the Strategy <b>{vault?.name}</b>. Please note that profit/loss settlements occur only once the Following is stopped or Strategy is closed.</Text>
                                    <Box my={4}>
                                        <Text>Wallet balance <Text as='b'><TruncatedNumberValue content={userUsdAmount + ""} /> USD</Text></Text>
                                        <InputGroup>
                                            <InputLeftAddon children="Deposit" opacity={0.7} />
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
                                    {/* <Box my={4}>
<Text>Your profit share: {100 - vault?.profitShare}%</Text>
</Box> */}
                                    <Box my={4} color="orange.400">
                                        <Text fontSize='xs'>⚠️ Please be informed that following a strategy using Covesting Copy-trading Module involves risk of capital loss. Following a strategy could result in a partial or complete loss of your funds, therefore, you should not operate with funds you cannot afford to lose.</Text>
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
                                    <Text>You followed successfully the Strategy of <b>{vault?.name}</b>. Please note that profit/loss settlements occur only once the Following is stopped or Strategy is closed.</Text>
                                    <Box my={4}>
                                        <Text>Wallet balance <Text as='b'><TruncatedNumberValue content={userUsdAmount + ""} /> USD</Text></Text>
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
        </Box >
    );
}

export default FollowDialog;