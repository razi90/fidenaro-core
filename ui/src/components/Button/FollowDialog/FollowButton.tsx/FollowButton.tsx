import { Button } from '@chakra-ui/react';
import { followButtonStyle } from './Styled';

interface FollowButtonProps {
    onClick: () => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ onClick }) => {
    return (
        <Button
            {...followButtonStyle}
            onClick={onClick}
        >
            Follow
        </Button >
    );
};

export default FollowButton;