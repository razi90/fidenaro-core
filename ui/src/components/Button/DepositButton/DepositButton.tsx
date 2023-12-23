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
    vaultName: string
    vaultFee: number
}

export const DepositButton: React.FC<DepositButtonProps> = ({ vaultName, vaultFee }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Tooltip label='Deposit stable coin'>
                <Button
                    //as={Link}
                    onClick={() => setIsOpen(true)}
                    sx={followButtonStyle}
                    size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                    title="Deposit Stable Coins"
                //href="https://twitter.com/fidenaro"
                >
                    Deposit
                </Button>
            </Tooltip>
            <FollowDialog isOpen={isOpen} setIsOpen={setIsOpen} vaultName={vaultName} vaultFee={vaultFee} />
        </>
    );
};

