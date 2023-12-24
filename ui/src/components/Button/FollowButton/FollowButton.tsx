import {
    Link,
    Button,
    Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';

import { followButtonStyle } from './Styled';
import FollowDialog from '../../Dialog/FollowDialog/FollowDialog';


interface FollowButtonProps {
    vaultName: string;
    vaultFee: number;
    isConnected: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ vaultName, vaultFee, isConnected }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isConnected ? (
                <Tooltip label='Follow this trader'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={followButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Follow the Vault"

                    >
                        Follow
                    </Button>
                </Tooltip>
            ) : (
                <Tooltip label='Follow this trader'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={followButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Follow the Vault"
                        isDisabled={true}
                    >
                        Follow
                    </Button>
                </Tooltip>
            )}
            <FollowDialog isOpen={isOpen} setIsOpen={setIsOpen} vaultName={vaultName} vaultFee={vaultFee} />
        </>
    );
};

