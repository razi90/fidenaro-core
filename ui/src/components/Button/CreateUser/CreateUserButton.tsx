import { useState } from 'react';
import CreateUserDialog from '../../Dialog/CreateUserDialog/CreateUserDialog';
import { FaUserCircle } from "react-icons/fa";
import { Box, Button, Text, Link } from '@chakra-ui/react';
import { LeftNavigationButtonIcon } from '../../LeftNavigationBar/LeftNavigationButtonIcon';
import { leftNavigationButtonStyle } from '../../LeftNavigationBar/Styled';

interface CreateUserButtonProps {
    navIsMinimized: boolean;
}

export const CreateUserButton: React.FC<(CreateUserButtonProps)> = ({ navIsMinimized }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                className='create-profile-button-first-step'
                as={Link}
                onClick={() => setIsOpen(true)}
                sx={leftNavigationButtonStyle}
                title={'Create User'}
            >
                <LeftNavigationButtonIcon icon={FaUserCircle} />

                <Box w="100%">
                    {navIsMinimized ? null : <Text pl={3}>{'Create User'}</Text>}
                </Box>
            </Button>
            <CreateUserDialog isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
    );
};

export default CreateUserButton;
