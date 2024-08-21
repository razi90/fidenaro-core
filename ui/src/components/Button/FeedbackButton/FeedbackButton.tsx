import React, { useState } from 'react';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Tooltip,
    Text,
    Textarea,
    Box,
} from '@chakra-ui/react';
import axios from 'axios';
import { defaultLinkButtonStyle } from '../DefaultLinkButton/Styled';
import { MdOutlineRateReview } from "react-icons/md";
import { defaultHighlightedLinkButtonStyle } from '../DefaultHighlightedLinkButton/Styled';
import CancelButton from '../Dialog/CancelButton.tsx/CancelButton';
import { useSnackbar } from 'notistack';
import Filter from 'bad-words';
import { useQuery } from '@tanstack/react-query';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { fetchConnectedWallet } from '../../../libs/wallet/WalletDataService';


function FeedbackDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');


    // Bad word filter
    const filter = new Filter();

    const { enqueueSnackbar } = useSnackbar();

    const webhookUrl = 'https://discord.com/api/webhooks/1184944429996449843/K_SmTf1qP2GsoVWL0se-cFBZ0j44wma9Pia2cvZitZf6IeqiPB0-C_5olNRRGUNrR3Tm';

    const onOpen = () => setIsOpen(true);
    const onClose = () => {
        setIsOpen(false);
        setUserInput('');
    };

    const handleInputChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setUserInput(event.target.value);
    };

    const handleSubmit = async () => {
        try {
            // Create a payload for the Discord webhook
            const payload = {
                content: userInput,
            };

            // filter bad words in profile name
            if (filter.clean(userInput) != userInput) {
                enqueueSnackbar("Sorry, you've used bad words.", { variant: 'error' });
                return
            }

            // Send a POST request to the Discord webhook
            const response = await axios.post(webhookUrl, payload);


            // Check if the response status is in the 2xx range to indicate success
            if (response.status >= 200 && response.status < 300) {
                // Log success or handle any other UI changes
                enqueueSnackbar('Feedback sent successfully', { variant: 'success' });
            } else {
                // Handle unsuccessful response
                enqueueSnackbar('Request failed', { variant: 'error' });
            }

            // Close the dialog
            onClose();
        } catch (error) {
            // Handle errors, e.g., network issues or incorrect webhook URL
            enqueueSnackbar('Request failed', { variant: 'error' });
        }
    };

    // load wallet data
    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    // wallet not connected
    if ((wallet?.persona) == undefined) {
        // Return error JSX if an error occurs during fetching
        return (
            <>
            </>
        );
    }


    return (
        <>
            <Tooltip label='Send us your feedback'>
                <Button
                    onClick={onOpen}
                    sx={defaultLinkButtonStyle}
                    size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                    title="Send us your feedback"
                >
                    <Text pr={1}>Send Feedback</Text> <MdOutlineRateReview fontSize="1.5em" />

                </Button>
            </Tooltip>
            <Modal isCentered isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Feedback</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Textarea
                            placeholder="Enter your feedback..."
                            value={userInput}
                            onChange={handleInputChange}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            sx={defaultHighlightedLinkButtonStyle}
                            onClick={handleSubmit}
                        >
                            Send
                        </Button >
                        <Box m={1}></Box>
                        <CancelButton onClick={onClose} />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default FeedbackDialog;
