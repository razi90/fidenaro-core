import {
    Link,
    Button,
    Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';

import { followButtonStyle } from './Styled';
import FollowDialog from '../../FollowDialog/FollowDialog';


interface FollowButtonProps {
    vaultName: string
    vaultFee: number
}

export const FollowButton: React.FC<FollowButtonProps> = ({ vaultName, vaultFee }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Tooltip label='Follow this trader'>
                <Button
                    //as={Link}
                    onClick={() => setIsOpen(true)}
                    sx={followButtonStyle}
                    size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                    title="Follow the Vault"
                //href="https://twitter.com/fidenaro"
                >
                    Follow
                </Button>
            </Tooltip>
            <FollowDialog isOpen={isOpen} setIsOpen={setIsOpen} vaultName={vaultName} vaultFee={vaultFee} />
        </>
    );
};

