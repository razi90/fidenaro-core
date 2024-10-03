import {
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
    InputGroup,
    InputLeftElement,
    Icon,
    Textarea,
    Button,
    InputLeftAddon,
    FormControl,
    FormErrorMessage,
    FormHelperText,
} from "@chakra-ui/react";
import CancelButton from "../../Button/Dialog/CancelButton.tsx/CancelButton";
import { FaDiscord, FaTelegram, FaTwitter } from "react-icons/fa";
import { User } from "../../../libs/entities/User";
import { useEffect, useState } from "react";
import { defaultHighlightedLinkButtonStyle } from "../../Button/DefaultHighlightedLinkButton/Styled";
import { enqueueSnackbar } from "notistack";
import { rdt } from "../../../libs/radix-dapp-toolkit/rdt";
import {
    USER_FACTORY_COMPONENT_ADDRESS,
    USER_NFT_RESOURCE_ADDRESS,
} from "../../../libs/fidenaro/Config";
import Filter from "bad-words";

interface ProfileEditDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: User | undefined;
}

const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
    isOpen,
    setIsOpen,
    user,
}) => {
    const onClose = () => setIsOpen(false);
    const [isLoading, setIsLoading] = useState(false);
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

    useEffect(() => {
        if (user) {
            setUserName(user.name || "");
            setUserBio(user.bio || "");
            setPfpUrl(user.avatar || "");
            setTwitter(user.twitter || "");
            setTelegram(user.telegram || "");
            setDiscord(user.discord || "");
        }
    }, [user]);

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

    const handleValidation = () => {
        const newErrors = {
            userName: validateUserName(userName),
            userBio: validateUserBio(userBio),
            pfpUrl: validatePfpUrl(pfpUrl),
            twitter: validateTwitter(twitter),
            telegram: validateTelegram(telegram),
            discord: validateDiscord(discord),
        };
        setErrors(newErrors);

        // Check if there are any errors
        return Object.values(newErrors).every((error) => error === "");
    };

    const handleChange = (
        field: string,
        value: string
    ) => {
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

    const changeProfileData = async () => {
        if (!handleValidation()) {
            enqueueSnackbar("Please fix the errors in the form.", {
                variant: "error",
            });
            return;
        }

        setIsLoading(true);

        let mapTuples = "";

        if (userName !== user?.name) {
            mapTuples += getMapTupleForMetadata("user_name", userName);
        }
        if (userBio !== user?.bio) {
            mapTuples += getMapTupleForMetadata("bio", userBio);
        }
        if (pfpUrl !== user?.avatar) {
            mapTuples += getMapTupleForMetadata("pfp_url", pfpUrl);
        }
        if (twitter !== user?.twitter) {
            mapTuples += getMapTupleForMetadata("twitter", twitter);
        }
        if (telegram !== user?.telegram) {
            mapTuples += getMapTupleForMetadata("telegram", telegram);
        }
        if (discord !== user?.discord) {
            mapTuples += getMapTupleForMetadata("discord", discord);
        }

        if (mapTuples === "") {
            enqueueSnackbar("No fields were changed.", { variant: "warning" });
            setIsLoading(false);
            return;
        }

        const manifest = `
      CALL_METHOD
          Address("${user?.account}")
          "withdraw"
          Address("${USER_NFT_RESOURCE_ADDRESS}")
          Decimal("1")
      ;
      TAKE_ALL_FROM_WORKTOP
          Address("${USER_NFT_RESOURCE_ADDRESS}")
          Bucket("user_token")
      ;
      CALL_METHOD
          Address("${USER_FACTORY_COMPONENT_ADDRESS}")
          "update_user_data"
          Bucket("user_token")
          Map<String, String>(
              ${mapTuples}
          )
      ;
      CALL_METHOD
          Address("${user?.account}")
          "deposit_batch"
          Expression("ENTIRE_WORKTOP")
      ;
    `;

        console.log(manifest);

        try {
            const result = await rdt.walletApi.sendTransaction({
                transactionManifest: manifest,
                version: 1,
            });

            if (result.isOk()) {
                enqueueSnackbar(`Metadata successfully changed.`, {
                    variant: "success",
                });
                console.log("Successfully edited profile data: ", result.value);
            } else {
                throw new Error(result.error.message);
            }
        } catch (error) {
            enqueueSnackbar("Failed to change metadata.", { variant: "error" });
            console.error("Failed to edit profile data: ", error);
        } finally {
            onClose();
            setIsLoading(false);
        }
    };

    function getMapTupleForMetadata(key: string, value: string): string {
        return `
      "${key}" => "${value}",
    `;
    }

    const isValidUrl = (urlString: string | URL) => {
        try {
            return Boolean(new URL(urlString));
        } catch (e) {
            return false;
        }
    };

    // Determine if the form can be submitted
    const isFormValid =
        Object.values(errors).every((error) => error === "") &&
        userName.trim().length >= 3 &&
        userBio.trim().length >= 1 &&
        (pfpUrl.trim().length === 0 || isValidUrl(pfpUrl.trim())) &&
        twitter.trim().length <= 15 &&
        telegram.trim().length <= 32 &&
        discord.trim().length <= 32;

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Profile</ModalHeader>
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
                                    <FormHelperText>Provide a valid image URL.</FormHelperText>
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
                            loadingText="Confirming..."
                            onClick={changeProfileData}
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

export default ProfileEditDialog;
