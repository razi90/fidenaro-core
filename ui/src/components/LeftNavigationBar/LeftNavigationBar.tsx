import React, { useState } from 'react';
import {
    Box,
    Button,
    Text,
    VStack,
    Icon,
    Center,
} from '@chakra-ui/react';
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';
import { FaMedal, FaQuestion, FaBookOpen, FaChartPie, FaChartBar, FaUserCircle } from "react-icons/fa";

import { LeftNavigationButton } from "./LeftNavigationButton"

import {
    leftNavigationToggleButtonStyle,
    leftNavigationToggleIconStyle,
    leftNavigationMainVStackStyle,
    leftNavigationMainBoxStyle,
    leftNavigationDividerBoxStyle,
} from "./Styled";
import { useQuery } from '@tanstack/react-query';
import { User } from '../../libs/entities/User';
import { fetchUserInfo } from '../../libs/user/UserDataService';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { fetchConnectedWallet } from '../../libs/wallet/WalletDataService';
import CreateUserButton from '../Button/CreateUser/CreateUserButton';
import { fetchLeftNavigationStatus } from '../../libs/navigation/LeftNavigationBarDataService';

interface LeftNavigationBarProps {
    isMinimized: boolean;
    setIsMinimized: (value: boolean) => void;
}

const LeftNavigationBar: React.FC<LeftNavigationBarProps> = ({ isMinimized, setIsMinimized }) => {

    const toggleMinimize = () => {

        const navi = fetchLeftNavigationStatus(); // queryClient.getQueryData(['left_navi_status']) ?? false

        localStorage.setItem('leftNavigationBarIsMinimized', JSON.stringify(!navi));
        setIsMinimized(!navi);
    };

    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });
    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    const filteredUserId = user?.id.replace(/#/g, "");

    return (
        <Box
            sx={leftNavigationMainBoxStyle}
            width={isMinimized ? "60px" : "200px"}
        >
            <VStack align="stretch" sx={leftNavigationMainVStackStyle}>
                {wallet?.persona == undefined ?
                    (
                        <CreateUserButton
                            navIsMinimized={isMinimized}
                        />
                    ) : (
                        <>
                            {user?.id == '' ? (
                                <CreateUserButton
                                    navIsMinimized={isMinimized}
                                />
                            ) : (
                                <LeftNavigationButton
                                    link={`/profile/${filteredUserId}`}
                                    title={user ? user.name : 'Profile'}
                                    icon={user ? user.avatar : FaUserCircle}
                                    navIsMinimized={isMinimized}
                                />
                            )
                            }
                        </>
                    )
                }


                <Box sx={leftNavigationDividerBoxStyle(isMinimized)}>
                    {isMinimized ? null : <Text as='b'>Trade</Text>}
                </Box>

                <LeftNavigationButton link="/" title="Explore" icon={FaChartBar} navIsMinimized={isMinimized} />
                <LeftNavigationButton link="/portfolio" title="Portfolio" icon={FaChartPie} navIsMinimized={isMinimized} />
                <LeftNavigationButton link="/walloffame" title="Wall of Fame" icon={FaMedal} navIsMinimized={isMinimized} />

                <Box sx={leftNavigationDividerBoxStyle(isMinimized)}>
                    {isMinimized ? null : <Text as='b'>More</Text>}
                </Box>

                <LeftNavigationButton link="/faq" title="FAQ" icon={FaQuestion} navIsMinimized={isMinimized} />
                <LeftNavigationButton link="https://docs.fidenaro.com/" title="Documentation" icon={FaBookOpen} navIsMinimized={isMinimized} />

                <Box>
                    <Button
                        onClick={toggleMinimize}
                        sx={leftNavigationToggleButtonStyle(isMinimized)}
                    >
                        {isMinimized ?
                            <Icon as={ArrowRightIcon} sx={leftNavigationToggleIconStyle} />
                            :
                            <Icon as={ArrowLeftIcon} sx={leftNavigationToggleIconStyle} />
                        }
                    </Button>
                </Box>
            </VStack >
        </Box >
    );
};

export default LeftNavigationBar;

function setIsOpen(arg0: boolean) {
    throw new Error('Function not implemented.');
}
