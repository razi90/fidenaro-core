import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Box, Stack, InputGroup, InputLeftElement, Icon, Checkbox, Textarea, Button, InputLeftAddon } from "@chakra-ui/react";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";
import { FaDiscord, FaTelegram, FaTwitter } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { User } from "../../../libs/entities/User";
import { USER_NFT_RESOURCE_ADDRESS, fetchUserInfo } from "../../../libs/user/UserDataService";
import { useEffect, useState } from "react";
import { defaultHighlightedLinkButtonStyle } from "../../Button/DefaultHighlightedLinkButton/Styled";
import { enqueueSnackbar } from "notistack";
import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";

interface ProfileEditDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    user: User | undefined;
}


const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({ isOpen, setIsOpen, user }) => {
    const onClose = () => setIsOpen(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [userBio, setUserBio] = useState('');
    const [pfpUrl, setPfpUrl] = useState('');
    const [twitter, setTwitter] = useState('');
    const [telegram, setTelegram] = useState('');
    const [discord, setDiscord] = useState('');

    useEffect(() => {
        if (user) {
            setUserName(user.name || '');
            setUserBio(user.bio || '');
            setPfpUrl(user.avatar || '');
            setTwitter(user.twitter || '');
            setTelegram(user.telegram || '');
            setDiscord(user.discord || '');
        }
    }, []);

    const changeProfileData = async () => {
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

        let manifest = ''

        if (userName != user?.name) {
            manifest += getManifestForMetadata("user_name", userName)
        }
        if (userBio != user?.bio) {
            manifest += getManifestForMetadata("bio", userBio)
        }
        if (pfpUrl != user?.avatar) {
            manifest += getManifestForMetadata("pfp_url", pfpUrl)
        }
        if (twitter != user?.twitter) {
            manifest += getManifestForMetadata("twitter", twitter)
        }
        if (telegram != user?.telegram) {
            manifest += getManifestForMetadata("telegram", telegram)
        }
        if (discord != user?.discord) {
            manifest += getManifestForMetadata("discord", discord)
        }

        if (manifest === '') {
            enqueueSnackbar('No fields were changed.', { variant: "warning" });
            return
        }

        console.log(manifest)

        const result = await rdt.walletApi
            .sendTransaction({
                transactionManifest: manifest,
                version: 1,
            })

        if (result.isOk()) {
            enqueueSnackbar(`Metadata successfully changed.`, { variant: 'success' });
            console.log("Successfully edited profile data: ", result.value);
        }

        if (result.isErr()) {
            enqueueSnackbar('Failed to change metadata.', { variant: 'error' });
            console.log("Failed to create edit profile data: ", result.error);
        }

        onClose();
        setIsLoading(false);
    }

    function getManifestForMetadata(key: string, value: string): string {
        let manifest = `
            CALL_METHOD
            Address("${USER_NFT_RESOURCE_ADDRESS}")
            "update_non_fungible_data"
            NonFungibleLocalId("${user?.id}")
            "${key}"
            "${value}"
            ;
        `
        return manifest;
    }

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
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                            <Textarea
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
                                onClick={changeProfileData}
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

export default ProfileEditDialog;