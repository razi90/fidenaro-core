import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Box, Stack, InputGroup, InputLeftElement, Icon, Checkbox } from "@chakra-ui/react";
import ConfirmButton from "../Button/Dialog/ConfirmButton.tsx/ConfirmButton";
import CancelButton from "../Button/Dialog/CancelButton.tsx/CancelButton";
import { FaDiscord, FaTelegram, FaTwitter } from "react-icons/fa";

interface ProfileEditDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
}


const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({ isOpen, setIsOpen }) => {
    const onClose = () => setIsOpen(false);

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
                            />
                            <Input
                                placeholder="Write Your Bio"
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
                                <Input
                                    placeholder="Enter Your Twitter Handle"
                                />
                            </InputGroup>
                            <InputGroup>
                                <InputLeftElement pointerEvents='none'>
                                    <Icon as={FaTelegram} boxSize={5} />
                                </InputLeftElement>
                                <Input
                                    placeholder="Enter Your Telegram Handle"
                                />
                            </InputGroup>
                            <InputGroup>
                                <InputLeftElement pointerEvents='none'>
                                    <Icon as={FaDiscord} boxSize={5} />
                                </InputLeftElement>
                                <Input
                                    placeholder="Enter Your Discord Handle"
                                />
                            </InputGroup>
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <CancelButton onClick={onClose} />
                        <ConfirmButton onClick={onClose} />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default ProfileEditDialog;