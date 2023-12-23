import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Box, Stack, InputGroup, InputLeftElement, Icon, Checkbox, Textarea, Button } from "@chakra-ui/react";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";
import { defaultHighlightedLinkButtonStyle } from "../../Button/DefaultHighlightedLinkButton/Styled";

interface CreateVaultDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
}


const CreateVaultDialog: React.FC<CreateVaultDialogProps> = ({ isOpen, setIsOpen }) => {
    const onClose = () => setIsOpen(false);

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
                            />
                            <Textarea placeholder='Vault description' />
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            sx={defaultHighlightedLinkButtonStyle}
                            onClick={onClose}
                        >
                            Confirm
                        </Button >
                        <Box m={1}></Box>
                        <CancelButton onClick={onClose} />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default CreateVaultDialog;