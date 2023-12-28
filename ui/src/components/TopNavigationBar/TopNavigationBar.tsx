import {
    Box,
    Flex,
    Link,
    IconButton,
    Image,
    Text,
    useDisclosure,
    Center,
    Spacer,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { WalletButton } from '../Button/WalletButton/WalletButton';

import {
    topNavigationBoxStyle,
    topNavigationHiddenBoxStyle,
    topNavigationMainFlexStyle,
    topNavigationLogoStyle,
    topNavigationHamburgerMenuStyle,
} from "./Styled";
import FeedbackButton from "../Button/FeedbackButton/FeedbackButton";
import { CreateVaultButton } from "../Button/CreateVault/CreateVault";



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

                        <FeedbackButton />

                        <CreateVaultButton user="John Smith" />

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


