import { Button, Tooltip, Text, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Spinner } from '@chakra-ui/react';
import { defaultLinkButtonStyle } from '../DefaultLinkButton/Styled';
import { FaHandHoldingDollar } from 'react-icons/fa6';
import { enqueueSnackbar } from 'notistack';
import { rdt } from '../../../libs/radix-dapp-toolkit/rdt';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { fetchConnectedWallet } from '../../../libs/wallet/WalletDataService';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';


const GetFusdButton: React.FC = () => {
    const { data: wallet } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);


    const onClose = () => setIsModalOpen(false);

    const sendToken = async () => {
        if (wallet?.persona === undefined) {
            setIsModalOpen(true);
            return;
        }

        enqueueSnackbar('Please confirm the action in your wallet', {
            variant: 'info',
        });

        setIsTransactionInProgress(true);

        try {
            let manifest = `
                CALL_METHOD
                    Address("component_tdx_2_1cr5s6adygr6s9ck5y6532yrd9fq8gn2ruy9skwryur309fn2heyjc8")
                    "free_token"
                ;
                CALL_METHOD
                    Address("${wallet.accounts[0].address}")
                    "deposit_batch"
                    Expression("ENTIRE_WORKTOP")
                ;
            `
            const result = await rdt.walletApi
                .sendTransaction({
                    transactionManifest: manifest,
                    version: 1,
                })

            // Check transaction result and update UI accordingly
            if (result.isOk()) {
                enqueueSnackbar('FUSD successfully obtained.', { variant: 'success' });
                console.log("FUSD obtained: ", result.value);
            }

            if (result.isErr()) {
                enqueueSnackbar('Failed to obtain FUSD.', { variant: 'error' });
                console.log("Failed to obtain FUSD: ", result.error);
            }
        } catch (error) {
            enqueueSnackbar('An unexpected error occurred.', { variant: 'error' });
            console.error("Error in obtaining FUSD: ", error);
        } finally {
            setIsTransactionInProgress(false); // End transaction
        }

    };

    return (
        <>
            <Tooltip label='Money Printer Goes Brrr'>
                <Button
                    onClick={sendToken}
                    sx={defaultLinkButtonStyle}
                    size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                    title="Money Printer Goes Brrr"
                    isLoading={isTransactionInProgress}
                    loadingText="Processing"
                >
                    <Text pr={1}>Get FUSD</Text> <FaHandHoldingDollar />
                </Button>
            </Tooltip>

            {wallet?.persona === undefined && (
                <Modal isOpen={isModalOpen} onClose={onClose} isCentered size="xl">
                    <ModalOverlay />
                    <ModalContent >
                        <ModalHeader>Wallet not connected!</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>Please connect your Radix DLT Wallet in order to get FUSD.</Text>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}
        </>
    );
};

export default GetFusdButton;