import React from 'react';
import { Th, Button, Icon, Text } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { TableEntryKeys } from './TableEntryKeys';
import { explorerTableHeaderTextStyle } from './Styled';

interface SortableTableHeaderProps {
    label: string;
    column: TableEntryKeys;
    sortedColumn: string | null;
    sortOrder: 'asc' | 'desc';
    handleSort: (column: TableEntryKeys) => void;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
    label,
    column,
    sortedColumn,
    sortOrder,
    handleSort,
}) => {
    const isSorted = sortedColumn === column;

    return (
        <Th isNumeric>
            <Button textTransform="none" variant='link' onClick={() => handleSort(column)}>
                <Text sx={explorerTableHeaderTextStyle}>{label}</Text>
                {isSorted && (
                    <Icon as={sortOrder === 'asc' ? ChevronDownIcon : ChevronUpIcon} boxSize={4} ml={1} />
                )}
            </Button>
        </Th>
    );
};

export default SortableTableHeader;