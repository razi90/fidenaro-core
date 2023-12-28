import {
    Button,
    Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';

import { followButtonStyle } from './Styled';
import TradeDialog from '../../Dialog/TradeDialog/TradeDialog';
import { Vault } from '../../../libs/entities/Vault';


interface TradeButtonProps {
    vault: Vault | undefined;
    isConnected: boolean;
}

export const TradeButton: React.FC<TradeButtonProps> = ({ vault, isConnected }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isConnected ? (
                <Tooltip label='Trade on this Vault'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={followButtonStyle}
                        title="Trade on this Vault"
                    >
                        Trade
                    </Button>
                </Tooltip>
            ) : (
                <Tooltip label='Trade on this Vault'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={followButtonStyle}
                        title="Trade on this Vault"
                        isDisabled={true}
                    >
                        Trade
                    </Button>
                </Tooltip>
            )}
            <TradeDialog isOpen={isOpen} setIsOpen={setIsOpen} vault={vault} />
        </>
    );
};

