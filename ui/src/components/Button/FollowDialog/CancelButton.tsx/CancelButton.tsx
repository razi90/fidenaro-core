import { Button } from '@chakra-ui/react';
import { cancelButtonStyle } from './Styled';

interface CancelButtonProps {
    onClick: () => void;
}

const CancelButton: React.FC<CancelButtonProps> = ({ onClick }) => {
    return (
        <Button
            {...cancelButtonStyle}
            onClick={onClick}
        >
            Cancel
        </Button >
    );
};

export default CancelButton;