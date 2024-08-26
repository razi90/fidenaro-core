import {
    Link,
    Button,
    Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';

import { followButtonStyle } from './Styled';
import FollowDialog from '../../Dialog/FollowDialog/FollowDialog';
import { Vault } from '../../../libs/entities/Vault';

interface DepositButtonProps {
    vault: Vault | undefined;
    isConnected: boolean;
    onDepositComplete?: () => void;
}

export const DepositButton: React.FC<DepositButtonProps> = ({ vault, isConnected, onDepositComplete }) => {

    const [isOpen, setIsOpen] = useState(false);

    const handleDepositComplete = () => {
        setIsOpen(false);
        if (onDepositComplete) {
            onDepositComplete();  // Call the callback after deposit is complete
        }
    };

    return (
        <>
            {isConnected ? (
                <Tooltip label='Deposit XRD'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={followButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Deposit XRD"
                    >
                        Deposit
                    </Button>
                </Tooltip>
            ) : (
                <Tooltip label='Deposit XRD'>
                    <Button
                        sx={followButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Deposit XRD"
                        isDisabled={true}
                    >
                        Deposit
                    </Button>
                </Tooltip>
            )}

            <FollowDialog
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                vault={vault}
                onDepositComplete={handleDepositComplete}
            />
        </>
    );
};
