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
    Flex,
    Spacer,
    VStack,
    HStack,
    StackDivider,
    Collapse,
    Input,
    Link,
    Tooltip,
    Button,
    SkeletonText
} from '@chakra-ui/react';
import { FollowButton } from '../../Button/FollowButton/FollowButton';
import SortableTh from './SortableTableHeader';
import { explorerTableHeaderPerformanceTextStyle, explorerTableHeaderTextStyle } from './Styled';
import FilterSelect from './Filter/FilterSelect';

import FilterButton from '../../Button/FilterButton/FilterButton';
import { Vault } from '../../../libs/entities/Vault';
import { MinimalChartCard } from '../../Chart/MinimalChartCard';
import { defaultLinkButtonStyle } from '../../Button/DefaultLinkButton/Styled';
import { tableTrStyle } from '../Styled';
import { IoEnterOutline } from "react-icons/io5";
import { User } from '../../../libs/entities/User';
import { TradeButton } from '../../Button/TradeButton/TradeButton';
import ResetButton from '../../Button/ResetButton/ResetButton';
import { TableEntryKeys } from './TableEntryKeys';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchVaultList } from '../../../libs/vault/VaultDataService';


interface VaultTableProps {
    smallHeader: string;
    tableData: Vault[] | undefined;
    isLoading: boolean;
    user: User | undefined;
    isConnected: boolean;
}
const VaultTable: React.FC<VaultTableProps> = ({ smallHeader, tableData, isLoading, user, isConnected }) => {

    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Define an interface for the possible keys of a vault table entry
    type TableEntryKeys = keyof Vault;

    // Controls the width of the element where the graph is and therefore the width of the graph
    const performanceFieldWidth = 150

    const [filteredData, setFilteredData] = useState<Vault[] | undefined>(tableData);

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


    useEffect(() => {
        const loadData = async () => {
            try {
                // Wait for both Promises to resolve
                await Promise.all([tableData]);

                setFilteredData(tableData);
                // Set the flag to indicate that the data is loaded
                setIsDataLoaded(true);
            } catch (error) {
                console.log('An error has occurred:', error);
            }
        };

        loadData();
    }, [tableData]);

    // Function to sort and filter the data
    useEffect(() => {
        if (tableData != undefined) {

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
                const followersMatch = entry.followers.length >= followersFilter;

                return nameMatch && totalMatch && todayMatch && activeDaysMatch && followersMatch;
            });
            // Set the sorder and filtered data
            setFilteredData(filteredEntries);

        }
    }, [nameFilter, totalFilter, todayFilter, activeDaysFilter, followersFilter, sortedColumn, sortOrder]);
    //}, [nameFilter, totalFilter, todayFilter, activeDaysFilter, followersFilter, filteredData, sortedColumn, sortOrder]);

    return (
        <Box mx={"0px"}>
            <VStack
                divider={<StackDivider borderColor='gray.200' />}
                align='stretch'
            >
                <Box>

                    <Flex>

                        <Spacer />
                        <Text>{smallHeader}</Text>
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

                    {
                        isLoading ? (

                            <Table size="sm">
                                <Thead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th>Total</Th>
                                        <Th>Today</Th>
                                        <Th>Active Days</Th>
                                        <Th>Follower</Th>
                                        <Th isNumeric>Performance</Th>
                                        <Th>Equity</Th>
                                        <Th></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <Tr key={index}>
                                            <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                                            <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                                            <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                                            <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                                            <Td>
                                                <SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' />
                                            </Td>
                                            <Td isNumeric>
                                                <SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' />
                                            </Td>
                                            <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                                            <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        ) : (

                            <Table size='sm'>
                                <Thead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <SortableTh column="total" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort}>Total</SortableTh>
                                        <SortableTh column="today" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort}>Today</SortableTh>
                                        <SortableTh column="activeDays" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort} >Active Days</SortableTh>
                                        <SortableTh column="followers" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort}>Followers</SortableTh>
                                        <Th isNumeric>
                                            Performance
                                        </Th>
                                        <SortableTh column="equity" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort} >Equity</SortableTh>
                                        <Th></Th>
                                    </Tr>
                                </Thead>
                                <Tbody >
                                    {filteredData?.map((entry, index) => (
                                        <Tr key={index} sx={tableTrStyle}
                                        //onClick={() => (window.location = `/vault/${entry.id}` as Location | (string & Location))}
                                        >
                                            <Td>
                                                <Tooltip label='Go to vault view'>
                                                    <Button
                                                        as={Link}
                                                        href={`/vault/${entry.id}`}
                                                        sx={defaultLinkButtonStyle}
                                                        title={entry.vault}
                                                    >
                                                        <IoEnterOutline /><Text pl={"10px"}>{entry.vault}</Text>
                                                    </Button>
                                                </Tooltip>
                                            </Td>
                                            <Td isNumeric color={entry.total >= 0 ? 'green.500' : 'red.500'}>
                                                {entry.total} %
                                            </Td>
                                            <Td isNumeric color={entry.today >= 0 ? 'green.500' : 'red.500'}>
                                                {entry.today} %
                                            </Td>
                                            <Td isNumeric>{entry.activeDays}</Td>
                                            <Td isNumeric>{entry.followers.length}</Td>
                                            <Td width={performanceFieldWidth}>

                                                <MinimalChartCard
                                                    cardTitle={""}
                                                    cardWidth={"200px"}
                                                    cardHeight={"60px"}
                                                    chartType={"area"}
                                                    chartHeight={"78px"}
                                                    chartWidth={"100%"}
                                                    chartData={entry.tradeHistory}
                                                    isLoading={false} />
                                            </Td>
                                            <Td isNumeric>{entry.equity}</Td>
                                            <Td>
                                                {
                                                    user?.id === entry.manager.id ?
                                                        (
                                                            <TradeButton vaultName={entry.vault} vaultID={entry.id} vaultFee={entry.profitShare} isConnected={isConnected} />
                                                        ) : (
                                                            <FollowButton vault={entry} isConnected={isConnected} />
                                                        )
                                                }

                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        )}
                </TableContainer>
            </VStack >
        </Box >
    );
};

export default VaultTable;
