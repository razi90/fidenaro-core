import { Button, Tooltip } from '@chakra-ui/react';
import { profileButtonStyle } from './Styled';
import { useState } from 'react';
import ProfileEditDialog from '../../Dialog/ProfileEditDialog/ProfileEditDialog';
import { User } from '../../../libs/entities/User';


interface ProfileEditButtonProps {
    user: User | undefined;
    isLoading: boolean;
}

const ProfileEditButton: React.FC<(ProfileEditButtonProps)> = ({ user, isLoading }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        isLoading ? null : (
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

                <ProfileEditDialog isOpen={isOpen} setIsOpen={setIsOpen} user={user} />
            </>
        )
    );
};

export default ProfileEditButton;
