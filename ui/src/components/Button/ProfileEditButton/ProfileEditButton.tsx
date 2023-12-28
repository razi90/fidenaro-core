import { Button, Tooltip } from '@chakra-ui/react';
import { profileButtonStyle } from './Styled';
import { useState } from 'react';
import ProfileEditDialog from '../../Dialog/ProfileEditDialog/ProfileEditDialog';


interface ProfileEditButtonProps {
    onClick: () => void;
}

const ProfileEditButton: React.FC<(ProfileEditButtonProps)> = () => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Tooltip label='Edit your Profile'>
                <Button
                    onClick={() => setIsOpen(true)}
                    sx={profileButtonStyle}
                    size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                    title="Edit your Profile"
                >
                    Edit
                </Button>
            </Tooltip>

            <ProfileEditDialog isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
    );
};

export default ProfileEditButton;
