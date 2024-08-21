import {
    Button,
    Tooltip,
    Text
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';

import { defaultLinkButtonStyle } from '../DefaultLinkButton/Styled';
import CreateVaultDialog from '../../Dialog/CreateVaultDialog/CreateVaultDialog';
import { BsSafe } from "react-icons/bs";

interface CreateVaultButtonProps {
    user: string
}

export const CreateVaultButton: React.FC<CreateVaultButtonProps> = ({ user }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Tooltip label='Create Vault'>
                <Button
                    className='create-vault-button-first-step'
                    onClick={() => setIsOpen(true)}
                    sx={defaultLinkButtonStyle}
                    title="Create Vault"
                >
                    <Text pr={1}>Create Vault</Text> <BsSafe fontSize="1.5em" />
                </Button>
            </Tooltip>

            <CreateVaultDialog isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
    );
};

