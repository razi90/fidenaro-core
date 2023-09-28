import {
    Box,
    Flex,
    Link,
    IconButton,
    Button,
    Image,
    Text,
    useDisclosure,
    Center,
    Spacer,
    Tooltip,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { FaPlus } from "react-icons/fa";
import { WalletButton } from '../Button/WalletButton/WalletButton';

import {
    topNavigationBoxStyle,
    topNavigationHiddenBoxStyle,
    topNavigationMainFlexStyle,
    topNavigationLogoStyle,
    topNavigationButtonStyle,
    topNavigationHamburgerMenuStyle,
} from "./Styled";


export default function TopNavigationBar() {
    const { isOpen, onOpen, onClose } = useDisclosure();


    return (
        <>
            <Box sx={topNavigationBoxStyle}>
                <Center>
                    <Flex sx={topNavigationMainFlexStyle}>
                        <Box>
                            <Link href={"#"}>
                                <Image
                                    align={"center"}
                                    sx={topNavigationLogoStyle}
                                    src="/images/LogoFidenaro.png"
                                    alt="Fidenaro Logo"
                                />
                            </Link>
                        </Box>
                        <Text color="black" fontSize='2xl'>Fidenaro</Text>
                        <Spacer />
                        <Tooltip label='Create Vault'>
                            <Button
                                sx={topNavigationButtonStyle}
                                title="Create Vault"
                            >
                                <FaPlus />
                            </Button>
                        </Tooltip>
                        <WalletButton />
                        <IconButton
                            icon={isOpen ? <CloseIcon color={"black"} boxSize={5} /> : <HamburgerIcon color={"black"} boxSize={7} />}
                            aria-label={"Open Menu"}
                            sx={topNavigationHamburgerMenuStyle}
                            display={{ md: "none" }}
                            onClick={isOpen ? onClose : onOpen}
                        />
                    </Flex>
                </Center>
            </Box>
            <Box sx={topNavigationHiddenBoxStyle} />
        </>
    );
}


