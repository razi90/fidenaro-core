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
    vaultName: string
    vaultFee: number
}

export const WithdrawButton: React.FC<WithdrawButtonProps> = ({ vaultName, vaultFee }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Tooltip label='Withdraw your stable coins'>
                <Button
                    //as={Link}
                    onClick={() => setIsOpen(true)}
                    sx={followButtonStyle}
                    size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                    title="Withdraw Stable Coins"
                //href="https://twitter.com/fidenaro"
                >
                    Withdraw
                </Button>
            </Tooltip>
            <FollowDialog isOpen={isOpen} setIsOpen={setIsOpen} vaultName={vaultName} vaultFee={vaultFee} />
        </>
    );
};

