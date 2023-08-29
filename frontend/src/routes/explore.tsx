import React, { useState, useEffect } from 'react';
import {
    Button,
    Icon,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
} from '@chakra-ui/react';
import { StarIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import tableData from '../dummy_data/vaults.json';
import { Link } from 'react-router-dom';
import InvestButton from '../etc/invest_button';
import { performInvestment } from '../etc/investment_utils';


// Define an interface for the table entry data
interface TableEntry {
    id: string,
    vault: string;
    total: string;
    today: string;
    activeDays: string;
    follower: string;
    equity: string;
}

// Define an interface for the possible keys of TableEntry
type TableEntryKeys = keyof TableEntry;

const Explore: React.FC = () => {
    const [favorites, setFavorites] = useState<number[]>([]);
    const [filteredData, setFilteredData] = useState<TableEntry[]>(tableData);
    const [sortedColumn, setSortedColumn] = useState<TableEntryKeys | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Function to check if an entry is marked as favorite
    const isFavorite = (index: number) => favorites.includes(index);

    // Function to toggle favorites on click
    const handleFavoriteClick = (index: number) => {
        if (favorites.includes(index)) {
            setFavorites((prevFavorites) => prevFavorites.filter((favIndex) => favIndex !== index));
        } else {
            setFavorites((prevFavorites) => [...prevFavorites, index]);
        }
    };

    // Function to handle sorting based on the selected column
    const handleSort = (column: TableEntryKeys) => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        setSortedColumn(column);
    };

    // Function to sort the data based on the selected column and order
    useEffect(() => {
        if (sortedColumn) {
            const sortedEntries = filteredData.slice().sort((a, b) => {
                const aValue = sortOrder === 'asc' ? Number(a[sortedColumn]) : Number(b[sortedColumn]);
                const bValue = sortOrder === 'asc' ? Number(b[sortedColumn]) : Number(a[sortedColumn]);
                return aValue - bValue;
            });
            setFilteredData(sortedEntries);
        }
    }, [sortedColumn, sortOrder, filteredData]);

    return (
        <>
            <TableContainer>
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>Vault</Th>
                            <Th isNumeric>
                                <Button
                                    variant='link' // Use 'link' variant to make the button transparent with visible content
                                    onClick={() => handleSort('total')}
                                    textAlign='start' // Align the button content to the start (left-aligned)
                                >
                                    Total
                                    {sortedColumn === 'total' && (
                                        <Icon as={sortOrder === 'asc' ? ChevronDownIcon : ChevronUpIcon} boxSize={4} ml={1} />
                                    )}
                                </Button>
                            </Th>
                            <Th isNumeric>
                                <Button
                                    variant='link' // Use 'link' variant to make the button transparent with visible content
                                    onClick={() => handleSort('today')}
                                    textAlign='start' // Align the button content to the start (left-aligned)
                                >
                                    Today
                                    {sortedColumn === 'today' && (
                                        <Icon as={sortOrder === 'asc' ? ChevronDownIcon : ChevronUpIcon} boxSize={4} ml={1} />
                                    )}
                                </Button>
                            </Th>
                            <Th isNumeric>
                                <Button
                                    variant='link' // Use 'link' variant to make the button transparent with visible content
                                    onClick={() => handleSort('activeDays')}
                                    textAlign='start' // Align the button content to the start (left-aligned)
                                >
                                    Active Days
                                    {sortedColumn === 'activeDays' && (
                                        <Icon as={sortOrder === 'asc' ? ChevronDownIcon : ChevronUpIcon} boxSize={4} ml={1} />
                                    )}
                                </Button>
                            </Th>
                            <Th isNumeric>
                                <Button
                                    variant='link' // Use 'link' variant to make the button transparent with visible content
                                    onClick={() => handleSort('follower')}
                                    textAlign='start' // Align the button content to the start (left-aligned)
                                >
                                    Follower
                                    {sortedColumn === 'follower' && (
                                        <Icon as={sortOrder === 'asc' ? ChevronDownIcon : ChevronUpIcon} boxSize={4} ml={1} />
                                    )}
                                </Button>
                            </Th>
                            <Th isNumeric>
                                <Button
                                    variant='link' // Use 'link' variant to make the button transparent with visible content
                                    onClick={() => handleSort('equity')}
                                    textAlign='start' // Align the button content to the start (left-aligned)
                                >
                                    Equity
                                    {sortedColumn === 'equity' && (
                                        <Icon as={sortOrder === 'asc' ? ChevronDownIcon : ChevronUpIcon} boxSize={4} ml={1} />
                                    )}
                                </Button>
                            </Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredData.map((entry, index) => (
                            <Tr key={index}>
                                <Td>
                                    <Link to={`/vault/${entry.id}`}>{entry.vault}</Link>
                                </Td>
                                <Td isNumeric color={parseFloat(entry.total) >= 0 ? 'green.500' : 'red.500'}>
                                    {entry.total} %
                                </Td>
                                <Td isNumeric color={parseFloat(entry.today) >= 0 ? 'green.500' : 'red.500'}>
                                    {entry.today} %
                                </Td>
                                <Td isNumeric>{entry.activeDays}</Td>
                                <Td isNumeric>{entry.follower}</Td>
                                <Td isNumeric>{entry.equity}</Td>
                                <Td>
                                    <InvestButton onInvest={(amount) => performInvestment(amount)} />
                                    <Button
                                        colorScheme='transparent'
                                        size='sm'
                                        ml={2}
                                        onClick={() => handleFavoriteClick(index)}
                                    >
                                        <Icon
                                            as={isFavorite(index) ? StarIcon : StarIcon}
                                            color={isFavorite(index) ? 'yellow.500' : 'gray.400'}
                                            boxSize={5}
                                        />
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </>
    );
};

export default Explore;
