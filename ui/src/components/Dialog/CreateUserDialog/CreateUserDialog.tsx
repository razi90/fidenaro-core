import { Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Box, Stack, Textarea, Button, Icon, InputGroup, InputLeftElement, InputLeftAddon } from "@chakra-ui/react";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";
import { defaultHighlightedLinkButtonStyle } from "../../Button/DefaultHighlightedLinkButton/Styled";
import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";
import { useQuery } from "@tanstack/react-query";
import { FidenaroComponentAddress } from "../../../libs/fidenaro/Config";
import { SetStateAction, useState } from "react";
import { enqueueSnackbar, useSnackbar } from "notistack";
import { WalletDataState } from "@radixdlt/radix-dapp-toolkit";
import { fetchConnectedWallet } from "../../../libs/wallet/WalletDataService";
import { FaTwitter, FaTelegram, FaDiscord } from "react-icons/fa6";

interface CreateUserDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
}


const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ isOpen, setIsOpen }) => {
    const onClose = () => setIsOpen(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [userBio, setUserBio] = useState('');
    const [pfpUrl, setPfpUrl] = useState('');
    const [twitter, setTwitter] = useState('');
    const [telegram, setTelegram] = useState('');
    const [discord, setDiscord] = useState('');

    // Get data to check if wallet is connected
    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    // is not connected to the radix chain
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
                            <Text>Please connect your Radix DLT Wallet in order to create a Fidenaro Profile.</Text>
                        </ModalBody>

                    </ModalContent>
                </Modal>
            </Box>
        );
    }

    const createUser = async () => {
        setIsLoading(true);

        // check if name is too short
        if (userName.trim().length < 3) {
            setIsLoading(false);
            enqueueSnackbar('Sorry, the name is too short.', { variant: 'error' });
            return
        }

        // check if description is too short
        if (userBio.trim().length < 10) {
            setIsLoading(false);
            enqueueSnackbar('Sorry, the description is too short.', { variant: 'error' });
            return
        }

        // check if url is valid
        if (!isValidUrl(pfpUrl.trim())) {
            setIsLoading(false);
            enqueueSnackbar('Sorry, the profile picture URL is invalid.', { variant: 'error' });
            return
        }

        // check if twitter handle is too short
        if (twitter.trim().length > 15) {
            setIsLoading(false);
            enqueueSnackbar('Sorry, the twitter handle is too long.', { variant: 'error' });
            return
        }

        // check if telegram handle is too short
        if (telegram.trim().length > 32) {
            setIsLoading(false);
            enqueueSnackbar('Sorry, the telegram handle is too long.', { variant: 'error' });
            return
        }

        // check if discord handle is too short
        if (discord.trim().length > 32) {
            setIsLoading(false);
            enqueueSnackbar('Sorry, the discord handle is too long.', { variant: 'error' });
            return
        }

        let manifest = `
            CALL_METHOD
                Address("${FidenaroComponentAddress}")
                "new_user"
                "${userName}"
                "${userBio}"
                "${pfpUrl}"
                "${twitter}"
                "${telegram}"
                "${discord}"
                ;
            CALL_METHOD
                Address("${wallet.accounts[0].address}")
        "deposit_batch"
        Expression("ENTIRE_WORKTOP")
            ;
        `

        console.log(manifest)

        const result = await rdt.walletApi
            .sendTransaction({
                transactionManifest: manifest,
                version: 1,
            })

        if (result.isOk()) {
            enqueueSnackbar(`Created user successfully.`, { variant: 'success' });
        }

        if (result.isErr()) {
            enqueueSnackbar('Failed to create user.', { variant: 'error' });
        }

        onClose();
        setIsLoading(false);
    };

    const isValidUrl = (urlString: string | URL) => {
        try {
            return Boolean(new URL(urlString));
        }
        catch (e) {
            return false;
        }
    }

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
                <ModalOverlay />
                <ModalContent >
                    <ModalHeader>Edit Profile</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={2}>
                            <Input
                                placeholder="Enter Nickname"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                            <Textarea
                                placeholder="Enter Bio"
                                value={userBio}
                                onChange={(e) => setUserBio(e.target.value)}
                            />
                            <Input
                                placeholder="Enter URL to Profile Picture"
                                value={pfpUrl}
                                onChange={(e) => setPfpUrl(e.target.value)}
                            />
                        </Stack>
                    </ModalBody>
                    <ModalHeader>Linked Accounts</ModalHeader>
                    <ModalBody>
                        <Stack spacing={2}>
                            <InputGroup>
                                <InputLeftElement pointerEvents='none'>
                                    <Icon as={FaTwitter} boxSize={5} />
                                </InputLeftElement>
                                <InputLeftAddon pl={10} children="https://twitter.com/" opacity={0.5} />
                                <Input
                                    placeholder="Enter Your Twitter Handle"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                />
                            </InputGroup>
                            <InputGroup>
                                <InputLeftElement pointerEvents='none'>
                                    <Icon as={FaTelegram} boxSize={5} />
                                </InputLeftElement>
                                <InputLeftAddon pl={10} children="https://t.me/@" opacity={0.5} />
                                <Input
                                    placeholder="Enter Your Telegram Handle"
                                    value={telegram}
                                    onChange={(e) => setTelegram(e.target.value)}
                                />
                            </InputGroup>
                            <InputGroup>
                                <InputLeftElement pointerEvents='none'>
                                    <Icon as={FaDiscord} boxSize={5} />
                                </InputLeftElement>
                                <InputLeftAddon pl={10} children="https://discord.gg/" opacity={0.5} />
                                <Input
                                    placeholder="Enter Your Discord Handle"
                                    value={discord}
                                    onChange={(e) => setDiscord(e.target.value)}
                                />
                            </InputGroup>
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
                                onClick={createUser}
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

export default CreateUserDialog;