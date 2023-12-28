import {
    Button,
    Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';

import { followButtonStyle } from './Styled';
import FollowDialog from '../../Dialog/FollowDialog/FollowDialog';
import { Vault } from '../../../libs/entities/Vault';


interface FollowButtonProps {
    vault: Vault
    isConnected: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ vault, isConnected }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isConnected ? (
                <Tooltip label='Follow this trader'>
                    <Button
                        onClick={() => setIsOpen(true)}
                        sx={followButtonStyle}
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
                        title="Follow the Vault"
                        isDisabled={true}
                    >
                        Follow
                    </Button>
                </Tooltip>
            )}
            <FollowDialog isOpen={isOpen} setIsOpen={setIsOpen} vault={vault} />
        </>
    );
};

