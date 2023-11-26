import { Button } from '@chakra-ui/react';
import { followButtonStyle } from './Styled';
import { useState } from 'react';
import ProfileEditDialog from '../../ProfileEditDialog/ProfileEditDialog';

interface ProfileEditButtonProps {
    onClick: () => void;
}

const ProfileEditButton: React.FC<(ProfileEditButtonProps)> = () => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                Edit
            </Button>
            <ProfileEditDialog isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
    );
};

export default ProfileEditButton;
