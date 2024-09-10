import { Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Box, Stack, Textarea, Button, Icon, InputGroup, InputLeftElement, InputLeftAddon } from "@chakra-ui/react";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";
import { defaultHighlightedLinkButtonStyle } from "../../Button/DefaultHighlightedLinkButton/Styled";
import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";
import { useQuery } from "@tanstack/react-query";
import { USER_FACTORY_COMPONENT_ADDRESS } from "../../../libs/fidenaro/Config";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { WalletDataState } from "@radixdlt/radix-dapp-toolkit";
import { fetchConnectedWallet } from "../../../libs/wallet/WalletDataService";
import { FaTwitter, FaTelegram, FaDiscord } from "react-icons/fa6";
import Filter from 'bad-words';
import { useQueryClient } from '@tanstack/react-query';

interface CreateUserDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
}


const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ isOpen, setIsOpen }) => {
    const onClose = () => setIsOpen(false);
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [userBio, setUserBio] = useState('');
    const [pfpUrl, setPfpUrl] = useState('');
    const [twitter, setTwitter] = useState('');
    const [telegram, setTelegram] = useState('');
    const [discord, setDiscord] = useState('');

    // Bad word filter
    const filter = new Filter();

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
        if (userBio.trim().length < 1) {
            setIsLoading(false);
            enqueueSnackbar('Sorry, the description is too short.', { variant: 'error' });
            return
        }

        // check if url is valid
        if (twitter.trim().length > 0 && !isValidUrl(pfpUrl.trim())) {
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

        // filter bad words in profile name
        if (filter.clean(userName) != userName) {
            setIsLoading(false);
            enqueueSnackbar("Sorry, you've used bad words.", { variant: 'error' });
            return
        }

        // filter bad words in bio text
        if (filter.clean(userBio) != userBio) {
            setIsLoading(false);
            enqueueSnackbar("Sorry, you've used bad words.", { variant: 'error' });
            return
        }

        let manifest = `
            CALL_METHOD
                Address("component_tdx_2_1cptxxxxxxxxxfaucetxxxxxxxxx000527798379xxxxxxxxxyulkzl")
                "free"
            ;
            CALL_METHOD
                Address("${USER_FACTORY_COMPONENT_ADDRESS}")
                "create_new_user"
                "${userName}"
                "${userBio}"
                "${pfpUrl}"
                "${twitter}"
                "${telegram}"
                "${discord}"
                ;
            CALL_METHOD
                Address("${wallet.accounts[0].address}")
                "try_deposit_batch_or_abort"
                Expression("ENTIRE_WORKTOP")
                Enum<0u8>()
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
            queryClient.invalidateQueries(['user_info']);
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
                <ModalContent>
                    <ModalHeader>Edit Profile</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={2}>
                            <Input
                                placeholder="Enter Nickname (required)"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                borderColor={!userName ? 'red.500' : 'gray.300'}  // Red border if empty
                                _focus={{ borderColor: !userName ? 'red.500' : 'blue.500' }}  // Red border on focus if empty
                                isRequired
                            />
                            <Textarea
                                placeholder="Enter Bio (required)"
                                value={userBio}
                                onChange={(e) => setUserBio(e.target.value)}
                                borderColor={!userBio ? 'red.500' : 'gray.300'}  // Red border if empty
                                _focus={{ borderColor: !userBio ? 'red.500' : 'blue.500' }}  // Red border on focus if empty
                                isRequired
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
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaTwitter} boxSize={5} />
                                </InputLeftElement>
                                <InputLeftAddon minW={"200px"} pl={10} children="https://twitter.com/" opacity={0.5} />
                                <Input
                                    placeholder="Enter Your Twitter Handle"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                />
                            </InputGroup>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaTelegram} boxSize={5} />
                                </InputLeftElement>
                                <InputLeftAddon minW={"200px"} pl={10} children="https://t.me/@" opacity={0.5} />
                                <Input
                                    placeholder="Enter Your Telegram Handle"
                                    value={telegram}
                                    onChange={(e) => setTelegram(e.target.value)}
                                />
                            </InputGroup>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaDiscord} boxSize={5} />
                                </InputLeftElement>
                                <InputLeftAddon minW={"200px"} pl={10} children="https://discord.gg/" opacity={0.5} />
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
                                loadingText="Confirm on your mobile wallet!"
                                sx={defaultHighlightedLinkButtonStyle}
                            >
                                Confirm
                            </Button>
                        ) : (
                            <Button
                                sx={defaultHighlightedLinkButtonStyle}
                                onClick={createUser}
                                disabled={!userName || !userBio}  // Disable if Name or Bio are empty
                            >
                                Confirm
                            </Button>
                        )}

                        <Box m={1}></Box>
                        <CancelButton onClick={onClose} />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default CreateUserDialog;