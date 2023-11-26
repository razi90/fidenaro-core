import { Button } from '@chakra-ui/react';
import { confirmButtonStyle } from './Styled';

interface ConfirmButtonProps {
    onClick: () => void;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({ onClick }) => {
    return (
        <Button
            {...confirmButtonStyle}
            onClick={onClick}
        >
            Confirm
        </Button >
    );
};

export default ConfirmButton;