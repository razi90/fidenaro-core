
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Text, Checkbox, Box, Stack, Link, FormControl, FormErrorMessage, Select, VStack, HStack, Spacer, useSteps, Divider, Progress, Button, InputGroup, InputLeftAddon, InputLeftElement, InputRightAddon } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { fetchUserInfo } from "../../../libs/user/UserDataService";
import { User } from "../../../libs/entities/User";

import ConfirmButton from "../../Button/Dialog/ConfirmButton.tsx/ConfirmButton";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";
import { Vault } from "../../../libs/entities/Vault";
import { Asset, Bitcoin, Ethereum, Hug, Radix, USDollar, addressToAsset } from "../../../libs/entities/Asset";
import { enqueueSnackbar } from "notistack";
import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";
import { TruncatedNumberValue } from "../../Text/TruncatedValue";
import { cancelButtonStyle } from "../../Button/Dialog/CancelButton.tsx/Styled";
import { defaultHighlightedLinkButtonStyle } from "../../Button/DefaultHighlightedLinkButton/Styled";
import { ManifestBuilder, address, decimal, RadixEngineToolkit, NetworkId } from "@radixdlt/radix-engine-toolkit";
import { fetchPriceList, PriceData } from "../../../libs/price/PriceDataService";
import { FIDENARO_FEE } from "../../../libs/fidenaro/Config";

interface TradeDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    vault: Vault | undefined,
    onComplete?: () => void;
}


const TradeDialog: React.FC<TradeDialogProps> = ({ isOpen, setIsOpen, vault, onComplete }) => {

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
    const [fromToken, setFromToken] = useState<Asset>(Radix);
    const [toToken, setToToken] = useState<Asset>(Bitcoin);
    const [amount, setAmount] = useState('');
    const [estimatedAmount, setEstimatedAmount] = useState('');
    const [estimatedFee, setEstimatedFee] = useState('');

    const tokens = [Radix, USDollar, Ethereum, Bitcoin, Hug];

    // read user data
    const { data: user, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });
    const { data: prices, isError: isPriceFetchError } = useQuery<Map<string, PriceData>>({ queryKey: ['prices'], queryFn: fetchPriceList });

    useEffect(() => {
        if (fromToken && toToken && amount) {
            const priceRatio = getPriceRatio(fromToken, toToken);
            const calculatedEstimatedAmount = Number(amount) * priceRatio;
            setEstimatedAmount((calculatedEstimatedAmount * (1 - FIDENARO_FEE)).toPrecision(8) + " " + toToken.ticker);
            setEstimatedFee((Number(amount) * FIDENARO_FEE).toPrecision(8) + " " + fromToken.ticker);
        } else {
            setEstimatedAmount('0.0');
            setEstimatedFee('0.0');
        }
    }, [fromToken, toToken, amount]);


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

    const handleAmountChange = (e: { target: { value: any; }; }) => {
        let value = e.target.value;

        if (value < 0) return;

        setAmount(value);
        setIsBalanceError(Number(value) > (vault?.userAssetValues.get(fromToken.address)?.amount || 0));
    };

    const getPriceRatio = (fromToken: Asset, toToken: Asset): number => {

        // Get the price of the fromToken and toToken in XRD from the priceList
        const fromTokenPriceInXRD = prices!.get(fromToken.address)?.priceInXRD;
        const toTokenPriceInXRD = prices!.get(toToken.address)?.priceInXRD;

        // If either price is undefined, return a default ratio or handle the error
        if (fromTokenPriceInXRD === undefined || toTokenPriceInXRD === undefined) {
            console.error("Token price not found in price list.");
            return 1; // Returning 1 as a fallback, but consider handling this more gracefully
        }

        // Calculate and return the price ratio
        const priceRatio = fromTokenPriceInXRD / toTokenPriceInXRD;
        return priceRatio;
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

        // Check if the fromToken and toToken are the same
        if (fromToken.address === toToken.address) {
            setIsLoading(false);
            setActiveStep(0);
            enqueueSnackbar('Cannot trade the same asset', { variant: 'error' });
            return;
        }

        // build manifest to open a position
        let transactionManifest = new ManifestBuilder()
            .callMethod(
                user?.account!,
                "create_proof_of_amount",
                [
                    address(
                        vault?.manager_badge_address!
                    ),
                    decimal(1),
                ]
            )
            .callMethod(
                vault?.id!,
                "open_position",
                [
                    address(
                        fromToken.address
                    ),
                    address(
                        toToken.address
                    ),
                    decimal(amount),
                ]
            )
            .build();

        let convertedInstructions = await RadixEngineToolkit.Instructions.convert(
            transactionManifest.instructions,
            NetworkId.Stokenet,
            "String"
        );

        console.log('trade manifest: ', convertedInstructions.value)

        // send manifest to extension for signing
        const result = await rdt.walletApi
            .sendTransaction({
                transactionManifest: convertedInstructions.value.toString(),
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

        if (onComplete) {
            onComplete();
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
                                            <InputRightAddon minW={"100px"} children={<Text> <TruncatedNumberValue content={(vault?.userAssetValues.get(fromToken?.address)?.amount || 0) + ""} /> </Text>} opacity={0.5} />
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
                                            <InputRightAddon minW={"100px"} children={<Text> <TruncatedNumberValue content={(vault?.userAssetValues.get(toToken?.address)?.amount || 0) + ""} /> </Text>} opacity={0.5} />
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
                                            <InputRightAddon p={0}>
                                                <Button
                                                    onClick={() => setAmount((vault?.userAssetValues.get(fromToken?.address)?.amount || 0).toString())}
                                                    variant="ghost"
                                                    size="sm"
                                                    borderRadius={0}
                                                >
                                                    Max
                                                </Button>
                                            </InputRightAddon>
                                        </InputGroup>
                                        <InputGroup>
                                            <InputLeftAddon children="Estimated Output" opacity={0.7} />
                                            <Input
                                                placeholder="0.0"
                                                type="text"
                                                value={estimatedAmount}
                                                isReadOnly
                                            />
                                        </InputGroup>
                                        <InputGroup>
                                            <InputLeftAddon children="Fidenaro Fee" opacity={0.7} />
                                            <Input
                                                placeholder="0.0"
                                                type="text"
                                                value={estimatedFee}
                                                isReadOnly
                                            />
                                        </InputGroup>
                                    </VStack>
                                </ModalBody>


                                <ModalFooter>
                                    <Stack>
                                        {/* <Box>
                                            <Checkbox>I confirm that I have read and agreed to the <Link>Terms and Conditions</Link> and fully understand all the associated risks.</Checkbox>
                                        </Box> */}
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
                                        <Text mb={2}>{fromToken?.ticker} Available Amount: <TruncatedNumberValue content={(vault?.userAssetValues.get(fromToken?.address)?.amount || 0) + ""} /> </Text>
                                        <Text mb={2}>{toToken?.ticker} Current Amount: <TruncatedNumberValue content={(vault?.userAssetValues.get(toToken?.address)?.amount || 0) + ""} /> </Text>
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