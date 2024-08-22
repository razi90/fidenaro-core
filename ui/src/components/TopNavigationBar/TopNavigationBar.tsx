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

import { useState, useEffect } from 'react';
import Joyride, { Step } from 'react-joyride';

import PriceTicker from "../PriceTicker/PriceTicker";



export default function TopNavigationBar() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [steps, setSteps] = useState<Step[]>([
        {
            target: '.wallet-first-step',
            content: 'First of all connect the wallet on the testnet. [Settings -> App Settings -> Gateways and Development Mode ON]. Afterwards get virtual XRD to pay the test fees via [Wallet Account -> Account Settings -> Dev Preferences -> Get XRD Test Tokens].',
        },
        {
            target: '.get-fusd-button-first-step',
            content: 'No you can order hier the Fidenaro Test stable coin FUSD. This is required to invest and trade with vaults.',
        },
        {
            target: '.create-profile-button-first-step',
            content: 'Create your Fidenaro User Profile in order to use the Fidenaro plattform.',
        },
        {
            target: '.create-vault-button-first-step',
            content: 'Create your vaults via the plus! Have fun :)',
        },
    ]);

    useEffect(() => {
        const localStorageItem = localStorage.getItem('joyrideCompleted');
        if (!localStorageItem) {
            // Set the localStorage item with an initialization value
            localStorage.setItem('joyrideCompleted', JSON.stringify(false));
        }
    }, []);

    const handleJoyrideCallback = (data: any) => {
        if (data.status === 'finished') {
            // Update the localStorage item when the joyride is completed
            localStorage.setItem('joyrideCompleted', JSON.stringify(true));
        }
    };

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

                        <PriceTicker />

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
            <Joyride
                steps={steps}
                continuous
                run={!JSON.parse(localStorage.getItem('joyrideCompleted') || 'false')}
                callback={handleJoyrideCallback}
                styles={{
                    options: {
                        arrowColor: "#6B5EFF",
                        backgroundColor: "white",
                        primaryColor: "#6B5EFF",
                        textColor: '#000',
                    },
                }}
            />
        </>
    );
}


