import { IconButton } from '@chakra-ui/react';
import { filterButtonStyle } from './Styled';
import { LuFilter } from 'react-icons/lu';

interface FilterButtonProps {
    onClick: () => void;
    showSection: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onClick, showSection }) => {
    return (
        <IconButton
            {...filterButtonStyle}
            aria-label='Filter vaults'
            icon={<LuFilter />}
            onClick={onClick}
        >
            {showSection ? 'Hide' : 'Show'}
        </IconButton>
    );
};

export default FilterButton;