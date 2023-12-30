
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Text, Checkbox, Box, Stack, Link, FormControl, FormErrorMessage, Select, VStack, HStack, Spacer, useSteps, Divider, Progress, Button, InputGroup, InputLeftAddon, InputLeftElement, InputRightAddon } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { fetchUserInfo } from "../../../libs/user/UserDataService";
import { User } from "../../../libs/entities/User";

import ConfirmButton from "../../Button/Dialog/ConfirmButton.tsx/ConfirmButton";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";
import { Vault } from "../../../libs/entities/Vault";
import { Asset, Bitcoin, Ethereum, USDollar, addressToAsset } from "../../../libs/entities/Asset";
import { enqueueSnackbar } from "notistack";
import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";
import { TruncatedNumberValue } from "../../Text/TruncatedValue";
import { cancelButtonStyle } from "../../Button/Dialog/CancelButton.tsx/Styled";
import { defaultHighlightedLinkButtonStyle } from "../../Button/DefaultHighlightedLinkButton/Styled";

interface TradeDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    vault: Vault | undefined
}


const TradeDialog: React.FC<TradeDialogProps> = ({ isOpen, setIsOpen, vault }) => {

    // Stepper
    const steps = [
        { title: 'First', description: 'Select trade pair and amount' },
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

    // on close handle
    const onClose = () => {
        setIsOpen(false);
        setActiveStep(0);

    }

    // on close handle
    const onContinue = () => {
        setActiveStep(0);
        setIsLoading(false);
    }

    const initialRef = useRef(null)
    const [isBalanceError, setIsBalanceError] = useState(false);
    const [fromToken, setFromToken] = useState<Asset>(USDollar);
    const [toToken, setToToken] = useState<Asset>(Bitcoin);
    const [amount, setAmount] = useState('');

    const tokens = [USDollar, Ethereum, Bitcoin];

    // read user data
    const { data: user, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });

    if (isUserFetchError) {
        return <Box>Error loading user data</Box>;
    }

    const handleFromSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedAddress = event.target.value;
        const selectedToken = addressToAsset(selectedAddress);
        setFromToken(selectedToken || null);
    };

    const handleToSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedAddress = event.target.value;
        const selectedToken = addressToAsset(selectedAddress);
        setToToken(selectedToken || null);
    };

    // balance error handling
    const handleAmountChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;

        //prevent negative values
        if (value < 0) return;

        setAmount(value);
        setIsBalanceError(Number(value) > (vault?.assets.get(fromToken.address) || 0));
    };

    const trade = async () => {

        // mark the action is in loading state
        setIsLoading(true);
        setActiveStep(1);

        // Check if the amount is 0 or empty
        if (!amount || Number(amount) === 0) {
            setIsLoading(false);
            setActiveStep(0);
            enqueueSnackbar('Please enter an amount greater than 0', { variant: 'error' });
            return;
        }

        // Check if the selected
        if (!amount || Number(amount) === 0) {
            setIsLoading(false);
            setActiveStep(0);
            enqueueSnackbar('Please enter an amount greater than 0', { variant: 'error' });
            return;
        }

        // Check if the fromToken and toToken are the same
        if (fromToken.address === toToken.address) {
            setIsLoading(false);
            setActiveStep(0);
            enqueueSnackbar('Cannot trade the same asset', { variant: 'error' });
            return;
        }

        // Check for ETH and BTC trading
        if ((fromToken.address === Ethereum.address && toToken.address === Bitcoin.address) ||
            (fromToken.address === Bitcoin.address && toToken.address === Ethereum.address)) {
            setIsLoading(false);
            setActiveStep(0);
            enqueueSnackbar('Trading between ETH and BTC is not allowed', { variant: 'error' });
            return;
        }

        // get the pool from the asset, which is not the stable coin
        let poolAddress = addressToAsset((fromToken.address === USDollar.address ? toToken.address : fromToken.address)).radiswap_address;

        // build manifast to create a trade vault
        let manifest = `
            CALL_METHOD
                Address("${user?.account}")
                "create_proof_of_amount"
                Address("${vault?.manager_badge_address}")
                Decimal("1")
            ;
            CALL_METHOD
                Address("${vault?.id}")
                "swap"
                Address("${fromToken.address}")
                Decimal("${amount}")
                Address("${poolAddress}")
            ;
            CALL_METHOD
                Address("${user?.account}")
                "deposit_batch"
                Expression("ENTIRE_WORKTOP")
            ;
            `

        console.log('trade manifest: ', manifest)

        // send manifast to extension for signing
        const result = await rdt.walletApi
            .sendTransaction({
                transactionManifest: manifest,
                version: 1,
            })

        if (result.isOk()) {
            enqueueSnackbar(`Successfully swapped ${fromToken.ticker} into ${toToken.ticker}.`, { variant: 'success' });
            console.log(`Successfully swapped ${fromToken.ticker} into ${toToken.ticker}.". Value ${result.value}`)

            queryClient.invalidateQueries({ queryKey: ['user_info'] })
            queryClient.invalidateQueries({ queryKey: ['vault_list'] })
            setActiveStep(2);
        }

        if (result.isErr()) {
            enqueueSnackbar(`Failed to swap ${fromToken.ticker} into ${toToken.ticker}: `, { variant: 'error' });
            console.log(`Failed to swap ${fromToken.ticker} into ${toToken.ticker}: `, result.error)

            setActiveStep(0);
        }

        setIsLoading(false);
    };

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" initialFocusRef={initialRef}>
                <ModalOverlay />
                <ModalContent >
                    <ModalHeader>Trade
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
                                    <VStack spacing={4} align="stretch">

                                        <InputGroup>
                                            <InputLeftAddon minW={"80px"} children="From:" opacity={0.5} />
                                            <Select
                                                placeholder="Select token"
                                                value={fromToken?.address || ''}
                                                onChange={handleFromSelectChange}
                                            >
                                                {tokens.map((token) => (
                                                    <option key={token.address} value={token.address}>{token.ticker}</option>
                                                ))}

                                            </Select>
                                            <InputRightAddon minW={"100px"} children={<Text> <TruncatedNumberValue content={(vault?.assets.get(fromToken?.address) || 0) + ""} /> </Text>
                                            } opacity={0.5} />
                                        </InputGroup>
                                        <InputGroup>
                                            <InputLeftAddon minW={"80px"} children="To:" opacity={0.5} />
                                            <Select
                                                placeholder="Select token"
                                                value={toToken?.address || ''}
                                                onChange={handleToSelectChange}
                                            >
                                                {tokens.map((token) => (
                                                    <option key={token.address} value={token.address}>{token.ticker}</option>
                                                ))}
                                            </Select>
                                            <InputRightAddon minW={"100px"} children={<Text> <TruncatedNumberValue content={(vault?.assets.get(toToken?.address) || 0) + ""} /> </Text>
                                            } opacity={0.5} />
                                        </InputGroup>
                                        <Divider />
                                        <InputGroup>
                                            <InputLeftAddon children="Amount" opacity={0.7} />
                                            <FormControl isInvalid={isBalanceError}>
                                                <Input
                                                    placeholder="0.0"
                                                    type="number"
                                                    min="0.0"
                                                    value={amount}
                                                    onChange={handleAmountChange}
                                                />
                                                {isBalanceError && (
                                                    <FormErrorMessage>Insufficient funds</FormErrorMessage>
                                                )}
                                            </FormControl>
                                        </InputGroup>

                                    </VStack>

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
                                                    onClick={trade}
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
                                    <Text>You traded successfully the amount <Text as='b'><TruncatedNumberValue content={amount + ""} /></Text> from <Text as='b'>{fromToken?.ticker}</Text> to <Text as='b'>{toToken?.ticker}</Text>. Please note that profit/loss settlements occur only once the Following is stopped or Strategy is closed.</Text>
                                    <Box my={4}>
                                        <Text mb={2}>{fromToken?.ticker} Available Amount: <TruncatedNumberValue content={(vault?.assets.get(fromToken?.address) || 0) + ""} /> </Text>
                                        <Text mb={2}>{toToken?.ticker} Current Amount: <TruncatedNumberValue content={(vault?.assets.get(toToken?.address) || 0) + ""} /> </Text>
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
                                            <Button
                                                sx={defaultHighlightedLinkButtonStyle}
                                                onClick={onContinue}
                                            >
                                                Continue
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

export default TradeDialog;