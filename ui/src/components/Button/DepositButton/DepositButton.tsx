import {
    Link,
    Button,
    Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';

import { followButtonStyle } from './Styled';
import FollowDialog from '../../Dialog/FollowDialog/FollowDialog';



interface DepositButtonProps {
    vaultName: string;
    vaultFee: number;
    isConnected: boolean;
}

export const DepositButton: React.FC<DepositButtonProps> = ({ vaultName, vaultFee, isConnected }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isConnected ? (
                <Tooltip label='Deposit stable coin'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={followButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Deposit Stable Coins"
                    >
                        Deposit
                    </Button>
                </Tooltip>
            ) : (
                <Tooltip label='Deposit stable coin'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={followButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Deposit Stable Coins"
                        isDisabled={true}
                    >
                        Deposit
                    </Button>
                </Tooltip>
            )}

            <FollowDialog isOpen={isOpen} setIsOpen={setIsOpen} vaultName={vaultName} vaultFee={vaultFee} />
        </>
    );
};

