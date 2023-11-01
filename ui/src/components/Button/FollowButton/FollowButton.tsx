import { Button, Tooltip } from '@chakra-ui/react';
import { followButtonStyle } from './Styled';

interface FollowButtonProps {
}

const FollowButton: React.FC<FollowButtonProps> = () => {
    return (
        <Tooltip label='Follow this trader'>
            <Button {...followButtonStyle} >
                Follow
            </Button>
        </Tooltip>
    );
};

export default FollowButton;
