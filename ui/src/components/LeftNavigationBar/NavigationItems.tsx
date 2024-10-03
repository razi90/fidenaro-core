import React from 'react';
import { VStack, Box, Text, Button, Icon } from '@chakra-ui/react';
import { FaMedal, FaBookOpen, FaChartPie, FaChartBar, FaUserCircle } from "react-icons/fa";
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';

import {
    leftNavigationMainVStackStyle,
    leftNavigationDividerBoxStyle,
    leftNavigationToggleButtonStyle,
    leftNavigationToggleIconStyle,
} from "./Styled";
import CreateUserButton from '../Button/CreateUser/CreateUserButton';
import { useQuery } from '@tanstack/react-query';
import { User } from '../../libs/entities/User';
import { fetchUserInfo } from '../../libs/user/UserDataService';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { fetchConnectedWallet } from '../../libs/wallet/WalletDataService';
import { LeftNavigationButton } from './LeftNavigationButton';

interface NavigationItemsProps {
    isMinimized?: boolean;
    toggleMinimize?: () => void;
}

export const NavigationItems: React.FC<NavigationItemsProps> = ({ isMinimized = false, toggleMinimize }) => {
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });
    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    const filteredUserId = user?.id.replace(/#/g, "");

    return (
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
                        )}
                    </>
                )}

            <Box sx={leftNavigationDividerBoxStyle(isMinimized)}>
                {isMinimized ? null : <Text as='b'>Trade</Text>}
            </Box>

            <LeftNavigationButton link="/" title="Explore" icon={FaChartBar} navIsMinimized={isMinimized} />
            <LeftNavigationButton link="/portfolio" title="Portfolio" icon={FaChartPie} navIsMinimized={isMinimized} />
            <LeftNavigationButton link="/walloffame" title="Wall of Fame" icon={FaMedal} navIsMinimized={isMinimized} />

            <Box sx={leftNavigationDividerBoxStyle(isMinimized)}>
                {isMinimized ? null : <Text as='b'>More</Text>}
            </Box>
            <LeftNavigationButton link="https://docs.fidenaro.com/" title="Documentation" icon={FaBookOpen} navIsMinimized={isMinimized} isExternal={true} />

            {toggleMinimize && (
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
            )}
        </VStack>
    );
};
