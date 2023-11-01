import React, { useState, useEffect } from 'react';
import {
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Text,
    Box,
    Heading,
    Flex,
    Spacer,
    VStack,
    HStack,
    StackDivider,
    Collapse,
    Input,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import FollowButton from '../Button/FollowButton/FollowButton';
import SortableTh from './SortableTableHeader';
import { TableEntry, TableEntryKeys } from './TableEntry';
import { explorerTableHeaderPerformanceTextStyle, explorerTableHeaderTextStyle } from './Styled';
import AreaChart from '../../libs/charts/MiniatureAreaChartApex';
import FilterSelect from './Filter/FilterSelect';
import ResetButton from '../Button/ResetButton.tsx/ResetButton';
import FilterButton from '../Button/FilterButton/FilterButton';

interface VaultTable {
    sortedColumn: string | null;
    sortOrder: 'asc' | 'desc';
    handleSort: (column: TableEntryKeys) => void;
}

// Dummy data for the graph
const seriesData = [30, 40, 35, 50, 49, 60, 70, 91, 125, 30, 40, 35, 50, 49, 60, 70, 91, 125];

const VaultTable: React.FC<{ tableData: TableEntry[] }> = ({ tableData }) => {

    // Controls the width of the element where the graph is and therefore the width of the graph
    const performanceFieldWidth = 250

    // Filtered and sorded table data
    const [filteredData, setFilteredData] = useState<TableEntry[]>(tableData);

    // State variables for sort values
    const [sortedColumn, setSortedColumn] = useState<TableEntryKeys | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // State variable for show/hide of filters
    const [showSection, setShowSection] = useState(false);

    // State variables for filter values
    const [nameFilter, setNameFilter] = useState('');
    const [totalFilter, setTotalFilter] = useState(Number.MIN_SAFE_INTEGER);
    const [todayFilter, setTodayFilter] = useState(Number.MIN_SAFE_INTEGER);
    const [activeDaysFilter, setActiveDaysFilter] = useState(Number.MIN_SAFE_INTEGER);
    const [followersFilter, setFollowersFilter] = useState(Number.MIN_SAFE_INTEGER);

    // Filter options
    const totalOptions = [-50, 0, 50, 100, 200];
    const todayOptions = [-10, 0, 10, 20];
    const activeDaysOptions = [30, 60, 90];
    const followersOptions = [10, 50, 100];

    const handleToggle = () => {
        setShowSection(!showSection);
    };

    // Function to handle sorting based on the selected column
    const handleSort = (column: TableEntryKeys) => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        setSortedColumn(column);
    };

    const resetFilters = () => {
        setNameFilter('');
        setTotalFilter(Number.MIN_SAFE_INTEGER);
        setTodayFilter(Number.MIN_SAFE_INTEGER);
        setActiveDaysFilter(Number.MIN_SAFE_INTEGER);
        setFollowersFilter(Number.MIN_SAFE_INTEGER);
    };

    // Function to sort and filter the data
    useEffect(() => {
        // Copy the original data to avoid mutating it
        let filteredEntries = [...tableData];

        // Apply sorting
        if (sortedColumn) {
            filteredEntries = filteredEntries.slice().sort((a, b) => {
                const aValue = sortOrder === 'asc' ? Number(a[sortedColumn]) : Number(b[sortedColumn]);
                const bValue = sortOrder === 'asc' ? Number(b[sortedColumn]) : Number(a[sortedColumn]);
                return aValue - bValue;
            });
        }

        // Apply filtering based on the filter criteria
        filteredEntries = filteredEntries.filter((entry) => {
            const nameMatch = entry.vault.toLowerCase().includes(nameFilter.toLowerCase());
            const totalMatch = entry.total >= totalFilter;
            const todayMatch = entry.today >= todayFilter;
            const activeDaysMatch = entry.activeDays >= activeDaysFilter;
            const followersMatch = entry.followers >= followersFilter;

            return nameMatch && totalMatch && todayMatch && activeDaysMatch && followersMatch;
        });
        // Set the sorder and filtered data
        setFilteredData(filteredEntries);
    }, [nameFilter, totalFilter, todayFilter, activeDaysFilter, followersFilter, filteredData, sortedColumn, sortOrder]);

    return (
        <Box>
            <VStack
                divider={<StackDivider borderColor='gray.200' />}
                align='stretch'
            >
                <Box>

                    <Flex>
                        <Heading>Explore</Heading>
                        <Spacer />
                        <Text>Become part of the community</Text>
                        <Spacer />
                        <HStack>
                            <ResetButton onClick={resetFilters} />
                            <Spacer />
                            <FilterButton onClick={handleToggle} showSection />
                        </HStack>
                    </Flex>

                    <Box>
                        <Collapse in={showSection} animateOpacity>
                            <Flex >
                                <Input
                                    placeholder='Name'
                                    value={nameFilter}
                                    onChange={(e) => setNameFilter(e.target.value)}
                                />

                                <FilterSelect
                                    placeholder='Total'
                                    value={totalFilter}
                                    onChange={setTotalFilter}
                                    options={totalOptions}
                                    is_percent={true}
                                />

                                <FilterSelect
                                    placeholder='Today'
                                    value={todayFilter}
                                    onChange={setTodayFilter}
                                    options={todayOptions}
                                    is_percent={true}
                                />

                                <FilterSelect
                                    placeholder='Active days'
                                    value={activeDaysFilter}
                                    onChange={setActiveDaysFilter}
                                    options={activeDaysOptions}
                                    is_percent={false}
                                />

                                <FilterSelect
                                    placeholder='Followers'
                                    value={followersFilter}
                                    onChange={setFollowersFilter}
                                    options={followersOptions}
                                    is_percent={false}
                                />
                            </Flex>
                        </Collapse>
                    </Box>
                </Box>
                <TableContainer>
                    <Table variant='simple'>
                        <Thead>
                            <Tr>
                                <Th textTransform="none">
                                    <Text sx={explorerTableHeaderTextStyle}>Name</Text>
                                </Th>
                                <SortableTh column="total" label="Total" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort} />
                                <SortableTh column="today" label="Today" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort} />
                                <SortableTh column="activeDays" label="Active Days" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort} />
                                <SortableTh column="followers" label="Followers" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort} />
                                <Th textTransform="none">
                                    <Text sx={explorerTableHeaderPerformanceTextStyle}>Performance</Text>
                                </Th>
                                <SortableTh column="equity" label="Equity" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort} />
                                <Th></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredData.map((entry, index) => (
                                <Tr key={index}>
                                    <Td>
                                        <Link to={`/vault/${entry.id}`}>{entry.vault}</Link>
                                    </Td>
                                    <Td isNumeric color={entry.total >= 0 ? 'green.500' : 'red.500'}>
                                        {entry.total} %
                                    </Td>
                                    <Td isNumeric color={entry.today >= 0 ? 'green.500' : 'red.500'}>
                                        {entry.today} %
                                    </Td>
                                    <Td isNumeric>{entry.activeDays}</Td>
                                    <Td isNumeric>{entry.followers}</Td>
                                    <Td width={performanceFieldWidth}>
                                        <AreaChart seriesData={seriesData} ></AreaChart>
                                    </Td>
                                    <Td isNumeric>{entry.equity}</Td>
                                    <Td>
                                        <FollowButton vaultName={entry.vault} vaultFee={entry.profitShare} />
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </VStack >
        </Box>
    );
};

export default VaultTable;
