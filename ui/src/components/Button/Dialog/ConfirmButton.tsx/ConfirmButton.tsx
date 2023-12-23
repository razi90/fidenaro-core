import { Button } from '@chakra-ui/react';
import { defaultLinkButtonStyle } from '../../DefaultLinkButton/Styled';

interface ConfirmButtonProps {
    onClick: () => void;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({ onClick }) => {
    return (
        <Button
            sx={defaultLinkButtonStyle}
            onClick={onClick}
        >
            Confirm
        </Button >
    );
};

export default ConfirmButton;