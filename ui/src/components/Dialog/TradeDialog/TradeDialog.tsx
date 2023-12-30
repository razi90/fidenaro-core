
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Text, Checkbox, Box, Stack, Link, FormControl, FormErrorMessage, Select, VStack, HStack, Spacer } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { fetchUserInfo } from "../../../libs/user/UserDataService";
import { User } from "../../../libs/entities/User";

import ConfirmButton from "../../Button/Dialog/ConfirmButton.tsx/ConfirmButton";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";
import { Vault } from "../../../libs/entities/Vault";
import { Asset, Bitcoin, Ethereum, USDollar, addressToAsset } from "../../../libs/entities/Asset";
import { enqueueSnackbar } from "notistack";
import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";

interface TradeDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    vault: Vault | undefined
}


const TradeDialog: React.FC<TradeDialogProps> = ({ isOpen, setIsOpen, vault }) => {
    const onClose = () => setIsOpen(false);
    const initialRef = useRef(null)
    const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);

        // Check if the amount is 0 or empty
        if (!amount || Number(amount) === 0) {
            setIsLoading(false);
            enqueueSnackbar('Please enter an amount greater than 0', { variant: 'error' });
            return;
        }

        // Check if the selected
        if (!amount || Number(amount) === 0) {
            setIsLoading(false);
            enqueueSnackbar('Please enter an amount greater than 0', { variant: 'error' });
            return;
        }

        // Check if the fromToken and toToken are the same
        if (fromToken.address === toToken.address) {
            setIsLoading(false);
            enqueueSnackbar('Cannot trade the same asset', { variant: 'error' });
            return;
        }

        // Check for ETH and BTC trading
        if ((fromToken.address === Ethereum.address && toToken.address === Bitcoin.address) ||
            (fromToken.address === Bitcoin.address && toToken.address === Ethereum.address)) {
            setIsLoading(false);
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
        }

        if (result.isErr()) {
            enqueueSnackbar(`Failed to swap ${fromToken.ticker} into ${toToken.ticker}: `, { variant: 'error' });
            console.log(`Failed to swap ${fromToken.ticker} into ${toToken.ticker}: `, result.error)
        }

        onClose();
        setIsLoading(false);
    };

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" initialFocusRef={initialRef}>
                <ModalOverlay />
                <ModalContent >
                    <ModalHeader>Trade</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <HStack>
                                    <Text mb={2}>From:</Text>
                                    <Spacer></Spacer>
                                    <Text mb={2}>Available Amount: {vault?.assets.get(fromToken?.address) || 0}</Text>
                                </HStack>
                                <Select
                                    placeholder="Select token"
                                    value={fromToken?.address || ''}
                                    onChange={handleFromSelectChange}
                                >
                                    {tokens.map((token) => (
                                        <option key={token.address} value={token.address}>{token.ticker}</option>
                                    ))}
                                </Select>
                            </Box>

                            <Box>
                                <HStack>
                                    <Text mb={2}>To:</Text>
                                    <Spacer></Spacer>
                                    <Text mb={2}>Current Amount: {vault?.assets.get(toToken?.address) || 0}</Text>
                                </HStack>
                                <Select
                                    placeholder="Select token"
                                    value={toToken?.address || ''}
                                    onChange={handleToSelectChange}
                                >
                                    {tokens.map((token) => (
                                        <option key={token.address} value={token.address}>{token.ticker}</option>
                                    ))}
                                </Select>
                            </Box>
                            <Box>
                                <Text mb={2}>Amount:</Text>
                                <FormControl isInvalid={isBalanceError}>
                                    <Input
                                        placeholder="0.0"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        type="number"
                                    />
                                    {isBalanceError && (
                                        <FormErrorMessage>Insufficient funds</FormErrorMessage>
                                    )}
                                </FormControl>
                            </Box>
                        </VStack>

                    </ModalBody>

                    <ModalFooter>
                        <Stack>
                            <Box>
                                <Checkbox>I confirm that I have read and agreed to the <Link>Terms and Conditions</Link> and fully understand all the associated risks.</Checkbox>
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="center">
                                <CancelButton onClick={onClose} />
                                <ConfirmButton onClick={trade} />
                            </Box>
                        </Stack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box >
    );
}

export default TradeDialog;