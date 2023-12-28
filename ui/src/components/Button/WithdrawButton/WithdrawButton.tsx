import {
    Link,
    Button,
    Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';

import { followButtonStyle } from './Styled';
import { Vault } from '../../../libs/entities/Vault';
import WithdrawDialog from '../../Dialog/WithdrawDialog/WithdrawDialog';


interface WithdrawButtonProps {
    vault: Vault | undefined,
    isConnected: boolean;
}

export const WithdrawButton: React.FC<WithdrawButtonProps> = ({ vault, isConnected }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isConnected ? (
                <Tooltip label='Withdraw your position'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={followButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Withdraw Your Position"

                    >
                        Withdraw
                    </Button>
                </Tooltip>
            ) : (
                <Tooltip label='Withdraw your position'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={followButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Withdraw Your Position"
                        isDisabled={true}
                    >
                        Withdraw
                    </Button>
                </Tooltip>
            )}
            <WithdrawDialog isOpen={isOpen} setIsOpen={setIsOpen} vault={vault} />
        </>
    );
};

