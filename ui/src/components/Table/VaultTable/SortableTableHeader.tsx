import React, { ReactNode } from 'react';
import { Th, Button, Icon, Text } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { TableEntryKeys } from './TableEntryKeys';
import { explorerTableHeaderTextStyle } from './Styled';
import { defaultLinkButtonStyle } from '../../Button/DefaultLinkButton/Styled';

interface SortableTableHeaderProps {
    children: ReactNode;
    column: TableEntryKeys;
    sortedColumn: string | null;
    sortOrder: 'asc' | 'desc';
    handleSort: (column: TableEntryKeys) => void;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
    children,
    column,
    sortedColumn,
    sortOrder,
    handleSort,
}) => {
    const isSorted = sortedColumn === column;

    return (
        <Th onClick={() => handleSort(column)} sx={defaultLinkButtonStyle}>

            {children}
            {isSorted && (
                <Icon as={sortOrder === 'asc' ? ChevronDownIcon : ChevronUpIcon} boxSize={4} ml={1} />
            )}

        </Th>
    );
};

export default SortableTableHeader;

