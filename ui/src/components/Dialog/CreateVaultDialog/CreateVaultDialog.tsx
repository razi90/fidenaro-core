import { Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Box, Stack, InputGroup, InputLeftElement, Icon, Checkbox, Textarea, Button } from "@chakra-ui/react";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";
import { defaultHighlightedLinkButtonStyle } from "../../Button/DefaultHighlightedLinkButton/Styled";
import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";
import { DataRequestBuilder, WalletDataState } from "@radixdlt/radix-dapp-toolkit";
import { useQuery } from "@tanstack/react-query";
import { fetchConnectedWallet } from "../../../libs/wallet/WalletDataService";
import { componentAddress } from "../../../libs/fidenaro/Config";
import { SetStateAction, useState } from "react";
import { useSnackbar } from "notistack";

interface CreateVaultDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
}


const CreateVaultDialog: React.FC<CreateVaultDialogProps> = ({ isOpen, setIsOpen }) => {
    const onClose = () => setIsOpen(false);
    const [vaultName, setVaultName] = useState('');
    const [vaultDescription, setVaultDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    // Get data to check if wallet is connected
    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    // error

    // is loading
    if ((wallet?.persona) == undefined) {
        // Return error JSX if an error occurs during fetching
        return (
            <Box>
                <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
                    <ModalOverlay />
                    <ModalContent >
                        <ModalHeader>Wallet not connected!</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>Please connect your Radix DLT Wallet in order to create a Fidenaro Vault.</Text>
                        </ModalBody>

                    </ModalContent>
                </Modal>
            </Box>
        );
    }

    //const accountAddress = wallet.accounts[0].address
    const accountAddress = ""

    const createVault = async () => {
        setIsLoading(true);

        // check if name is too short
        if (vaultName.trim().length < 6) {
            setIsLoading(false);
            enqueueSnackbar('Sorry, the name is to short.', { variant: 'error' });
            return
        }

        // check if description is too short
        if (vaultDescription.trim().length < 10) {
            setIsLoading(false);
            enqueueSnackbar('Sorry, the description is to short.', { variant: 'error' });
            return
        }

        // build manifast to create a trade vault
        let manifest = `
            CALL_METHOD
                Address("${componentAddress}")
                "new_vault"
                "${vaultName}"
                Decimal("10")
                "${vaultDescription}"
                "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
                "https://fidenaro.com";
            CALL_METHOD
                Address("${wallet.accounts[0].address}")
                "deposit_batch"
                Expression("ENTIRE_WORKTOP");`

        console.log('new_vault manifest: ', manifest)

        // send manifast to extension for signing
        const result = await rdt.walletApi
            .sendTransaction({
                transactionManifest: manifest,
                version: 1,
            })

        if (result.isOk()) {
            enqueueSnackbar(`Vault "${vaultName}" successfully created.`, { variant: 'success' });
            console.log(`Vault "${vaultName}" successfully created. Value ${result.value}`)
        }

        if (result.isErr()) {
            enqueueSnackbar('Failed to create a Vault', { variant: 'error' });
            console.log("Failed to create a Vault: ", result.error)
        }

        onClose();
        setIsLoading(false);
    };


    return (
        <Box>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
                <ModalOverlay />
                <ModalContent >
                    <ModalHeader>Create new Trading Vault</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={2}>
                            <Input
                                placeholder="Enter Vault Name"
                                value={vaultName}
                                onChange={(e) => setVaultName(e.target.value)}
                            />
                            <Textarea
                                placeholder='Vault description'
                                value={vaultDescription}
                                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setVaultDescription(e.target.value)}
                            />
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
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
                                onClick={createVault}
                            >
                                Confirm
                            </Button >
                        )
                        }

                        <Box m={1}></Box>
                        <CancelButton onClick={onClose} />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default CreateVaultDialog;