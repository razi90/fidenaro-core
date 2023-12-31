import React, { useEffect } from 'react';
import { walletButtonStyle, walletButtonBoxStyle } from './Styled';
import { Box, Button, Tooltip } from '@chakra-ui/react';
import { rdt } from '../../../libs/radix-dapp-toolkit/rdt'
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { defaultLinkButtonStyle } from '../DefaultLinkButton/Styled';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';

//rdt.buttonApi.setTheme('white-with-outline')

export const WalletButton: React.FC = () => {
    const queryClient = useQueryClient()

    return (
        <>
            <Tooltip label='Connect to your Wallet'>
                <Box className="wallet-first-step" sx={walletButtonBoxStyle}>
                    <style>{walletButtonStyle}</style>
                    <div className="connect-button-wrapper">
                        <radix-connect-button
                            personalabel=""
                            dappname=""
                            mode="light"
                            status=""
                            avatarurl=""
                            activetab=""
                            loggedintimestamp=""
                        ></radix-connect-button>
                    </div>
                </Box>
            </Tooltip>
        </>

    );
};
