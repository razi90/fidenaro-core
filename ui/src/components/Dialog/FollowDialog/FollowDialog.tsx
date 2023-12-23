
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Text, Checkbox, Box, Stack, Link, FormControl, FormErrorMessage } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { fetchUserInfo } from "../../../libs/user/UserDataService";
import { AppUser } from "../../../libs/entities/User";

import ConfirmButton from "../../Button/Dialog/ConfirmButton.tsx/ConfirmButton";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";

interface FollowDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    vaultName: string
    vaultFee: number
}


const FollowDialog: React.FC<FollowDialogProps> = ({ isOpen, setIsOpen, vaultName, vaultFee }) => {
    const onClose = () => setIsOpen(false);
    const initialRef = useRef(null)
    const [inputValue, setInputValue] = useState('');
    const [isBalanceError, setIsBalanceError] = useState(false);

    // read user data
    const { data: user, isError: isUserFetchError } = useQuery<AppUser>({ queryKey: ['user_info'], queryFn: fetchUserInfo });
    const userUsdAmount = user?.assets.USD;

    if (isUserFetchError) {
        return <Box>Error loading user data</Box>;
    }

    // balance error handling
    const handleChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;

        //prevent negative values
        if (value < 0) return;

        setInputValue(value);
        setIsBalanceError(Number(value) > userUsdAmount!);
    };

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" initialFocusRef={initialRef}>
                <ModalOverlay />
                <ModalContent >
                    <ModalHeader>New Following</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>You are about to Follow the Strategy <b>{vaultName}</b>. Please note that profit/loss settlements occur only once the Following is stopped or Strategy is closed.</Text>
                        <Box my={4}>
                            <Text>Wallet balance {userUsdAmount} USD</Text>
                            <Text><b>Deposit</b></Text>
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

                        </Box>
                        <Box my={4}>
                            <Text>Your profit share: {100 - vaultFee}%</Text>
                        </Box>
                        <Box my={4} color="orange.400">
                            <Text>⚠️ Please be informed that following a strategy using Covesting Copy-trading Module involves risk of capital loss. Following a strategy could result in a partial or complete loss of your funds, therefore, you should not operate with funds you cannot afford to lose.</Text>
                        </Box>
                    </ModalBody>

                    <ModalFooter>
                        <Stack>
                            <Box>
                                <Checkbox>I confirm that I have read and agreed to the <Link>Terms and Conditions</Link> and fully understand all the associated risks.</Checkbox>
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="center">
                                <CancelButton onClick={onClose} />
                                <ConfirmButton onClick={onClose} />
                            </Box>
                        </Stack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default FollowDialog;