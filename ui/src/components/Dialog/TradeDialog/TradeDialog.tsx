
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Text, Checkbox, Box, Stack, Link, FormControl, FormErrorMessage, Menu, MenuButton, MenuList, MenuItem, Button, Select, Flex } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { fetchUserInfo } from "../../../libs/user/UserDataService";
import { User } from "../../../libs/entities/User";

import ConfirmButton from "../../Button/Dialog/ConfirmButton.tsx/ConfirmButton";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface TradeDialogProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    vaultName: string
    vaultFee: number
}


const TradeDialog: React.FC<TradeDialogProps> = ({ isOpen, setIsOpen, vaultName, vaultFee }) => {
    const onClose = () => setIsOpen(false);
    const initialRef = useRef(null)
    const [inputValue, setInputValue] = useState('');
    const [isBalanceError, setIsBalanceError] = useState(false);

    // read user data
    const { data: user, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });
    const userUsdAmount = 0;

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
                    <ModalHeader>Trade</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>You are about to trade ont the <b>{vaultName}</b>.</Text>
                        <Select placeholder='Select exchange'>
                            <option value='unknown'>UNKNOWN</option>
                            <option value='cavier'>Cavier</option>
                            <option value='alpha'>AlphaDEX</option>
                            <option value='oci'>OCI</option>
                        </Select>

                        <Box my={4}>
                            <Text>Vault balance {userUsdAmount} USD</Text>
                            <Text><b>Trade</b></Text>
                            <Flex>
                                <Select placeholder='Select coin'>
                                    <option value='btc'>BTC</option>
                                    <option value='eth'>ETH</option>
                                    <option value='xrd'>XRD</option>
                                </Select>
                                <Select placeholder='Action' defaultValue={'buy'}>
                                    <option value='buy'>Buy</option>
                                    <option value='sell'>Sell</option>
                                </Select>
                                <Select placeholder='Vault Funds' defaultValue={'xusd'}>
                                    <option value='xusd'>XUSD</option>
                                </Select>
                            </Flex>
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

export default TradeDialog;