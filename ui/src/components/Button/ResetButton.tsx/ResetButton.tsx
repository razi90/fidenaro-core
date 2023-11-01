import { Button } from '@chakra-ui/react';
import { resetButtonStyle } from './Styled';

interface ResetButtonProps {
    onClick: () => void;
}

const ResetButton: React.FC<ResetButtonProps> = ({ onClick }) => {
    return (
        <Button
            {...resetButtonStyle}
            onClick={onClick}
        >
            Reset
        </Button >
    );
};

export default ResetButton;