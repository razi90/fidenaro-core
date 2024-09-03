import {
    Button,
    Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';

import TradeDialog from '../../Dialog/TradeDialog/TradeDialog';
import { Vault } from '../../../libs/entities/Vault';
import { tradeButtonStyle } from './Styled';


interface TradeButtonProps {
    vault: Vault | undefined;
    isConnected: boolean;
    onComplete?: () => void;
}

export const TradeButton: React.FC<TradeButtonProps> = ({ vault, isConnected, onComplete }) => {

    const [isOpen, setIsOpen] = useState(false);

    const handleComplete = () => {
        setIsOpen(false);
        if (onComplete) {
            onComplete();
        }
    };

    return (
        <>
            {isConnected ? (
                <Tooltip label='Trade on this Vault'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={tradeButtonStyle}
                        title="Trade on this Vault"
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                    >
                        Trade
                    </Button>
                </Tooltip>
            ) : (
                <Tooltip label='Trade on this Vault'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={tradeButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Trade on this Vault"
                        isDisabled={true}
                    >
                        Trade
                    </Button>
                </Tooltip>
            )}
            <TradeDialog isOpen={isOpen} setIsOpen={setIsOpen} vault={vault} onComplete={handleComplete} />
        </>
    );
};

