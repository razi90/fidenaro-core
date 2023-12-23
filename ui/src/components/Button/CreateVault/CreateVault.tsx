import {
    Button,
    Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';

import { defaultLinkButtonStyle } from '../DefaultLinkButton/Styled';
import { FaPlus } from 'react-icons/fa';
import CreateVaultDialog from '../../Dialog/CreateVaultDialog/CreateVaultDialog';


interface CreateVaultButtonProps {
    user: string
}

export const CreateVaultButton: React.FC<CreateVaultButtonProps> = ({ user }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Tooltip label='Create Vault'>
                <Button
                    onClick={() => setIsOpen(true)}
                    sx={defaultLinkButtonStyle}
                    title="Create Vault"
                >
                    <FaPlus />
                </Button>
            </Tooltip>

            <CreateVaultDialog isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
    );
};

