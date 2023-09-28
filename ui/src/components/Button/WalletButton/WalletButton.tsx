import React, { useEffect } from 'react';
import { walletButtonStyle, walletButtonBoxStyle } from './Styled';
import { Box, Tooltip } from '@chakra-ui/react';
import rdt from '../../../libs/radix-dapp-toolkit/rdt'

rdt.buttonApi.setTheme('white-with-outline')

export const WalletButton: React.FC = () => {
    useEffect(() => {
        const onLinkClick = (ev: Event) => {
            console.log('onLinkClick', (ev as CustomEvent).detail);
        };

        const radixConnectButton = document.querySelector('radix-connect-button');
        if (radixConnectButton) {
            radixConnectButton.addEventListener('onLinkClick', onLinkClick);
        }

        return () => {
            if (radixConnectButton) {
                radixConnectButton.removeEventListener('onLinkClick', onLinkClick);
            }
        };
    }, []);


    return (
        <Tooltip label='Connect to your Wallet'>
            <Box sx={walletButtonBoxStyle}>
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
    );
};
