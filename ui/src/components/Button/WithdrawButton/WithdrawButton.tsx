import {
    Link,
    Button,
    Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';

import { followButtonStyle } from './Styled';
import FollowDialog from '../../Dialog/FollowDialog/FollowDialog';


interface WithdrawButtonProps {
    vaultName: string;
    vaultFee: number;
    isConnected: boolean;
}

export const WithdrawButton: React.FC<WithdrawButtonProps> = ({ vaultName, vaultFee, isConnected }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isConnected ? (
                <Tooltip label='Withdraw your stable coins'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={followButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Withdraw Stable Coins"

                    >
                        Withdraw
                    </Button>
                </Tooltip>
            ) : (
                <Tooltip label='Withdraw your stable coins'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={followButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Withdraw Stable Coins"
                        isDisabled={true}
                    >
                        Withdraw
                    </Button>
                </Tooltip>
            )}
            <FollowDialog isOpen={isOpen} setIsOpen={setIsOpen} vaultName={vaultName} vaultFee={vaultFee} />
        </>
    );
};

