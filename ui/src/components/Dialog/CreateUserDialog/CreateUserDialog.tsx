import {
    Text,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Input,
    Box,
    Stack,
    Textarea,
    Button,
    Icon,
    InputGroup,
    InputLeftElement,
    InputLeftAddon,
    FormControl,
    FormErrorMessage,
} from "@chakra-ui/react";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";
import { defaultHighlightedLinkButtonStyle } from "../../Button/DefaultHighlightedLinkButton/Styled";
import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { USER_FACTORY_COMPONENT_ADDRESS } from "../../../libs/fidenaro/Config";
import { useState, useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import { WalletDataState } from "@radixdlt/radix-dapp-toolkit";
import { fetchConnectedWallet } from "../../../libs/wallet/WalletDataService";
import { FaTwitter, FaTelegram, FaDiscord } from "react-icons/fa6";
import Filter from "bad-words";

interface CreateUserDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
    isOpen,
    setIsOpen,
}) => {
    const onClose = () => setIsOpen(false);
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    // Input States
    const [userName, setUserName] = useState("");
    const [userBio, setUserBio] = useState("");
    const [pfpUrl, setPfpUrl] = useState("");
    const [twitter, setTwitter] = useState("");
    const [telegram, setTelegram] = useState("");
    const [discord, setDiscord] = useState("");

    // Error States
    const [errors, setErrors] = useState({
        userName: "",
        userBio: "",
        pfpUrl: "",
        twitter: "",
        telegram: "",
        discord: "",
    });

    // Bad word filter
    const filter = new Filter();

    // Fetch connected wallet data
    const {
        data: wallet,
        isLoading: isWalletFetchLoading,
        isError: isWalletFetchError,
    } = useQuery<WalletDataState>({
        queryKey: ["wallet_data"],
        queryFn: fetchConnectedWallet,
    });

    useEffect(() => {
        if (isOpen) {
            // Reset form fields and errors when the modal is opened
            setUserName("");
            setUserBio("");
            setPfpUrl("");
            setTwitter("");
            setTelegram("");
            setDiscord("");
            setErrors({
                userName: "",
                userBio: "",
                pfpUrl: "",
                twitter: "",
                telegram: "",
                discord: "",
            });
        }
    }, [isOpen]);

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

    // Validation Functions
    const validateUserName = (name: string): string => {
        if (name.trim().length < 3) {
            return "Name must be at least 3 characters.";
        }
        if (filter.isProfane(name)) {
            return "Name contains inappropriate language.";
        }
        return "";
    };

    const validateUserBio = (bio: string): string => {
        if (bio.trim().length < 1) {
            return "Description cannot be empty.";
        }
        if (filter.isProfane(bio)) {
            return "Description contains inappropriate language.";
        }
        return "";
    };

    const validatePfpUrl = (url: string): string => {
        if (url.trim().length > 0 && !isValidUrl(url.trim())) {
            return "Invalid URL format.";
        }
        return "";
    };

    const validateTwitter = (handle: string): string => {
        if (handle.trim().length > 15) {
            return "Twitter handle cannot exceed 15 characters.";
        }
        return "";
    };

    const validateTelegram = (handle: string): string => {
        if (handle.trim().length > 32) {
            return "Telegram handle cannot exceed 32 characters.";
        }
        return "";
    };

    const validateDiscord = (handle: string): string => {
        if (handle.trim().length > 32) {
            return "Discord handle cannot exceed 32 characters.";
        }
        return "";
    };

    // Handle input changes with real-time validation
    const handleChange = (field: string, value: string) => {
        switch (field) {
            case "userName":
                setUserName(value);
                setErrors((prev) => ({
                    ...prev,
                    userName: validateUserName(value),
                }));
                break;
            case "userBio":
                setUserBio(value);
                setErrors((prev) => ({
                    ...prev,
                    userBio: validateUserBio(value),
                }));
                break;
            case "pfpUrl":
                setPfpUrl(value);
                setErrors((prev) => ({
                    ...prev,
                    pfpUrl: validatePfpUrl(value),
                }));
                break;
            case "twitter":
                setTwitter(value);
                setErrors((prev) => ({
                    ...prev,
                    twitter: validateTwitter(value),
                }));
                break;
            case "telegram":
                setTelegram(value);
                setErrors((prev) => ({
                    ...prev,
                    telegram: validateTelegram(value),
                }));
                break;
            case "discord":
                setDiscord(value);
                setErrors((prev) => ({
                    ...prev,
                    discord: validateDiscord(value),
                }));
                break;
            default:
                break;
        }
    };

    // URL validation helper
    const isValidUrl = (urlString: string | URL) => {
        try {
            return Boolean(new URL(urlString));
        } catch (e) {
            return false;
        }
    };

    // Overall form validation
    const isFormValid =
        Object.values(errors).every((error) => error === "") &&
        userName.trim().length >= 3 &&
        userBio.trim().length >= 1 &&
        (pfpUrl.trim().length === 0 || isValidUrl(pfpUrl.trim())) &&
        twitter.trim().length <= 15 &&
        telegram.trim().length <= 32 &&
        discord.trim().length <= 32;

    // Handle form submission
    const createUser = async () => {
        if (!handleValidation()) {
            enqueueSnackbar("Please fix the errors in the form.", {
                variant: "error",
            });
            return;
        }

        setIsLoading(true);

        // Construct the transaction manifest
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
    `;

        console.log(manifest);

        try {
            const result = await rdt.walletApi.sendTransaction({
                transactionManifest: manifest,
                version: 1,
            });

            if (result.isOk()) {
                enqueueSnackbar(`Created user successfully.`, { variant: "success" });
                queryClient.invalidateQueries(["user_info"]);
            } else {
                throw new Error(result.error.message);
            }
        } catch (error) {
            enqueueSnackbar("Failed to create user.", { variant: "error" });
            console.error("Failed to create user: ", error);
        } finally {
            onClose();
            setIsLoading(false);
        }
    };

    // Handle overall validation before submission
    const handleValidation = (): boolean => {
        const newErrors = {
            userName: validateUserName(userName),
            userBio: validateUserBio(userBio),
            pfpUrl: validatePfpUrl(pfpUrl),
            twitter: validateTwitter(twitter),
            telegram: validateTelegram(telegram),
            discord: validateDiscord(discord),
        };
        setErrors(newErrors);

        // Return true if no errors
        return Object.values(newErrors).every((error) => error === "");
    };

    // If wallet is not connected, display an error modal
    if ((wallet?.persona) == undefined) {
        return (
            <Box>
                <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Wallet not connected!</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>
                                Please connect your Radix DLT Wallet in order to create a
                                Fidenaro Profile.
                            </Text>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Box>
        );
    }

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create New Profile</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={4}>
                            {/* Username Field */}
                            <FormControl isInvalid={errors.userName !== ""} isRequired>
                                <Input
                                    value={userName}
                                    onChange={(e) => handleChange("userName", e.target.value)}
                                    placeholder="Username*"
                                />
                                {errors.userName &&
                                    <FormErrorMessage>{errors.userName}</FormErrorMessage>
                                }
                            </FormControl>

                            {/* Bio Field */}
                            <FormControl isInvalid={errors.userBio !== ""} isRequired>
                                <Textarea
                                    value={userBio}
                                    onChange={(e) => handleChange("userBio", e.target.value)}
                                    placeholder="Tell us about yourself*"
                                />
                                {errors.userBio &&
                                    <FormErrorMessage>{errors.userBio}</FormErrorMessage>
                                }
                            </FormControl>

                            {/* Profile Picture URL */}
                            <FormControl isInvalid={errors.pfpUrl !== ""}>
                                <Input
                                    value={pfpUrl}
                                    onChange={(e) => handleChange("pfpUrl", e.target.value)}
                                    placeholder="Profile picture URL"
                                />
                                {errors.pfpUrl &&
                                    <FormErrorMessage>{errors.pfpUrl}</FormErrorMessage>
                                }
                            </FormControl>
                        </Stack>
                    </ModalBody>

                    <ModalHeader>Linked Accounts</ModalHeader>
                    <ModalBody>
                        <Stack spacing={4}>
                            {/* Twitter Handle */}
                            <FormControl isInvalid={errors.twitter !== ""}>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <Icon as={FaTwitter} boxSize={5} color="gray.500" />
                                    </InputLeftElement>
                                    <InputLeftAddon
                                        minW="200px"
                                        pl={10}
                                        children="https://twitter.com/"
                                        opacity={0.5}
                                    />
                                    <Input
                                        value={twitter}
                                        onChange={(e) => handleChange("twitter", e.target.value)}
                                        placeholder="Your Twitter handle"
                                    />
                                </InputGroup>
                                {errors.twitter &&
                                    <FormErrorMessage>{errors.twitter}</FormErrorMessage>
                                }
                            </FormControl>

                            {/* Telegram Handle */}
                            <FormControl isInvalid={errors.telegram !== ""}>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <Icon as={FaTelegram} boxSize={5} color="gray.500" />
                                    </InputLeftElement>
                                    <InputLeftAddon
                                        minW="200px"
                                        pl={10}
                                        children="https://t.me/@"
                                        opacity={0.5}
                                    />
                                    <Input
                                        value={telegram}
                                        onChange={(e) => handleChange("telegram", e.target.value)}
                                        placeholder="Your Telegram handle"
                                    />
                                </InputGroup>
                                {errors.telegram &&
                                    <FormErrorMessage>{errors.telegram}</FormErrorMessage>
                                }
                            </FormControl>

                            {/* Discord Handle */}
                            <FormControl isInvalid={errors.discord !== ""}>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <Icon as={FaDiscord} boxSize={5} color="gray.500" />
                                    </InputLeftElement>
                                    <InputLeftAddon
                                        minW="200px"
                                        pl={10}
                                        children="https://discord.gg/"
                                        opacity={0.5}
                                    />
                                    <Input
                                        value={discord}
                                        onChange={(e) => handleChange("discord", e.target.value)}
                                        placeholder="Your Discord handle"
                                    />
                                </InputGroup>
                                {errors.discord &&
                                    <FormErrorMessage>{errors.discord}</FormErrorMessage>
                                }
                            </FormControl>
                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            isLoading={isLoading}
                            loadingText="Creating..."
                            onClick={createUser}
                            isDisabled={!isFormValid || isLoading}
                            sx={defaultHighlightedLinkButtonStyle}
                        >
                            Confirm
                        </Button>
                        <Box mx={2} />
                        <CancelButton onClick={onClose} />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default CreateUserDialog;
