import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Input,
    Text,
    Box,
    Stack,
    FormControl,
    FormErrorMessage,
    Divider,
    Progress,
    Button,
    InputGroup,
    InputLeftAddon,
    useSteps,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";
import { fetchUserInfo } from "../../../libs/user/UserDataService";
import { User } from "../../../libs/entities/User";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";
import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";
import { Vault } from "../../../libs/entities/Vault";
import { enqueueSnackbar } from "notistack";
import { defaultHighlightedLinkButtonStyle } from "../../Button/DefaultHighlightedLinkButton/Styled";
import { cancelButtonStyle } from "../../Button/Dialog/CancelButton.tsx/Styled";
import { TruncatedNumberValue } from "../../Text/TruncatedValue";
import { USER_NFT_RESOURCE_ADDRESS } from "../../../libs/fidenaro/Config";
import {
    ManifestBuilder,
    address,
    decimal,
    array,
    ValueKind,
    nonFungibleLocalId,
    proof,
    bucket,
    expression,
    enumeration,
    RadixEngineToolkit,
    NetworkId,
} from "@radixdlt/radix-engine-toolkit";
import { convertToXRDString } from "../../../libs/etc/StringOperations";

interface WithdrawDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    vault: Vault | undefined;
    onWithdrawComplete?: () => void;
}

const WithdrawDialog: React.FC<WithdrawDialogProps> = ({
    isOpen,
    setIsOpen,
    vault,
    onWithdrawComplete,
}) => {
    // Stepper setup
    const steps = [
        { title: "First", description: "Select withdraw amount" },
        { title: "Second", description: "Confirm your transaction" },
        { title: "Third", description: "Transaction completed" },
    ];

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    const activeStepText = steps[activeStep].description;

    // State management
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isBalanceError, setIsBalanceError] = useState(false);
    const [inputError, setInputError] = useState("");

    const initialRef = useRef(null);
    const queryClient = useQueryClient();

    // Fetch user data
    const {
        data: user,
        isLoading: isUserFetchLoading,
        isError: isUserFetchError,
    } = useQuery<User>({
        queryKey: ["user_info"],
        queryFn: fetchUserInfo,
    });

    // Extract user share token amount
    const userShareTokenAmount = vault ? user?.assets.get(vault.shareTokenAddress) ?? 0 : 0;

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setInputValue("");
            setIsBalanceError(false);
            setInputError("");
            setActiveStep(0);
        }
    }, [isOpen, setActiveStep]);

    const onClose = () => {
        setIsOpen(false);
        setActiveStep(0);
    }

    // Validation Functions
    const validateInput = (value: string): string => {
        if (value.trim().length === 0) {
            return "Withdraw amount is required.";
        }
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0) {
            return "Please enter a valid amount greater than 0.";
        }
        if (numValue > userShareTokenAmount) {
            return "Insufficient funds.";
        }
        return "";
    };

    // Handle input changes with validation
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Prevent negative values
        if (Number(value) < 0) return;

        setInputValue(value);
        const errorMsg = validateInput(value);
        setInputError(errorMsg);
        setIsBalanceError(errorMsg === "Insufficient funds.");
    };

    // Handle form submission
    const withdraw = async () => {
        // Final validation before submission
        const finalError = validateInput(inputValue);
        if (finalError) {
            setInputError(finalError);
            enqueueSnackbar(finalError, { variant: "error" });
            return;
        }

        setIsLoading(true);
        setActiveStep(1);

        try {
            // Build the transaction manifest
            const transactionManifest = new ManifestBuilder()
                .callMethod(user?.account!, "withdraw", [
                    address(vault?.shareTokenAddress!),
                    decimal(inputValue),
                ])
                .callMethod(user?.account!, "create_proof_of_non_fungibles", [
                    address(USER_NFT_RESOURCE_ADDRESS),
                    array(ValueKind.NonFungibleLocalId, nonFungibleLocalId(user?.id!)),
                ])
                .createProofFromAuthZoneOfNonFungibles(
                    USER_NFT_RESOURCE_ADDRESS,
                    [user?.id!],
                    (builder, proofId) =>
                        builder.takeAllFromWorktop(vault?.shareTokenAddress!, (builder, bucketId) =>
                            builder.callMethod(vault?.id!, "withdraw", [
                                proof(proofId),
                                bucket(bucketId),
                            ])
                        )
                )
                .callMethod(user?.account!, "try_deposit_batch_or_abort", [
                    expression("EntireWorktop"),
                    enumeration(0),
                ])
                .build();

            const convertedInstructions = await RadixEngineToolkit.Instructions.convert(
                transactionManifest.instructions,
                NetworkId.Stokenet,
                "String"
            );

            console.log("withdraw manifest: ", convertedInstructions.value);

            // Send the transaction
            const result = await rdt.walletApi.sendTransaction({
                transactionManifest: convertedInstructions.value.toString(),
                version: 1,
            });

            if (result.isOk()) {
                enqueueSnackbar(`Successfully withdrew from vault "${vault?.name}".`, {
                    variant: "success",
                });
                console.log(
                    `Successfully withdrew from vault "${vault?.name}". Value ${result.value}`
                );

                queryClient.invalidateQueries({ queryKey: ["user_info"] });
                setActiveStep(2);
            } else {
                throw new Error(result.error.message);
            }
        } catch (error) {
            enqueueSnackbar(`Failed to withdraw from vault "${vault?.name}"`, {
                variant: "error",
            });
            console.error("Failed to withdraw: ", error);
            setActiveStep(0);
        } finally {
            if (onWithdrawComplete) {
                onWithdrawComplete();
            }
            setIsLoading(false);
        }
    };

    return (
        <Box>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                isCentered
                size="xl"
                initialFocusRef={initialRef}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Withdraw
                        <Stack>
                            <Divider />
                            <Text fontSize="md">
                                Action: <b>{activeStepText}</b>
                            </Text>
                            <Progress
                                borderRadius={7}
                                colorScheme="purple"
                                value={activeStep * 45 + 10}
                                height="10px"
                                width="full"
                                mt={2}
                            />
                        </Stack>
                    </ModalHeader>
                    <ModalCloseButton />

                    {(activeStep === 0 || activeStep === 1) ? (
                        <>
                            <ModalBody>
                                <Text>
                                    You are about to withdraw your position from the vault{" "}
                                    <b>{vault?.name}</b>.
                                </Text>
                                <Box my={4}>
                                    <InputGroup mt={4}>
                                        <InputLeftAddon children="Withdraw" opacity={0.7} />
                                        <FormControl isInvalid={!!inputError}>
                                            <Input
                                                ref={initialRef}
                                                placeholder="0"
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={inputValue}
                                                onChange={handleChange}
                                            />
                                            {inputError && <FormErrorMessage>{inputError}</FormErrorMessage>}
                                        </FormControl>
                                    </InputGroup>
                                    <Text fontSize="sm" color="gray.500">
                                        Available to withdraw: <TruncatedNumberValue content={userShareTokenAmount + ""} />
                                    </Text>
                                </Box>
                            </ModalBody>

                            <ModalFooter>
                                <Stack>
                                    <Box display="flex" justifyContent="flex-end">
                                        <CancelButton onClick={onClose} />
                                        <Button
                                            sx={defaultHighlightedLinkButtonStyle}
                                            onClick={withdraw}
                                            isLoading={isLoading}
                                            loadingText="Confirm on your mobile wallet!"
                                            isDisabled={
                                                isLoading ||
                                                inputValue.trim().length === 0 ||
                                                !!inputError
                                            }
                                            ml={2}
                                        >
                                            Confirm
                                        </Button>
                                    </Box>
                                </Stack>
                            </ModalFooter>
                        </>
                    ) : (
                        <>
                            <ModalBody>
                                <Text>
                                    You successfully withdrew the amount of <b>{inputValue}</b>{" "}
                                    vault shares.
                                </Text>
                                <Box my={4}>
                                    <Text>
                                        Current shares in the vault{" "}
                                        <Text as="b">
                                            <TruncatedNumberValue content={userShareTokenAmount + ""} />
                                        </Text>
                                    </Text>
                                </Box>
                            </ModalBody>
                            <ModalFooter>
                                <Stack>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Button sx={cancelButtonStyle} onClick={onClose}>
                                            Close
                                        </Button>
                                    </Box>
                                </Stack>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default WithdrawDialog;
