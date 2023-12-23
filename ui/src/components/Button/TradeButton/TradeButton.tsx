import {
    Link,
    Button,
    Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';

import { followButtonStyle } from './Styled';
import TradeDialog from '../../Dialog/TradeDialog/TradeDialog';


interface TradeButtonProps {
    vaultName: string;
    vaultID: string;
    vaultFee: number;
}

export const TradeButton: React.FC<TradeButtonProps> = ({ vaultID, vaultName, vaultFee }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Tooltip label='Trade on this Vault'>
                <Button
                    onClick={() => setIsOpen(true)}
                    sx={followButtonStyle}
                    size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                    title="Trade on this Vault"
                >
                    Trade
                </Button>
            </Tooltip>
            <TradeDialog isOpen={isOpen} setIsOpen={setIsOpen} vaultName={vaultName} vaultFee={vaultFee} />
        </>
    );
};

