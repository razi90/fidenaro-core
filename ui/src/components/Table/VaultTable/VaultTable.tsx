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
import SortableTh from './SortableTableHeader';
import FilterSelect from './Filter/FilterSelect';

import FilterButton from '../../Button/FilterButton/FilterButton';
import { Vault } from '../../../libs/entities/Vault';
import { defaultLinkButtonStyle } from '../../Button/DefaultLinkButton/Styled';
import { tableTrStyle } from '../Styled';
import { IoEnterOutline } from "react-icons/io5";
import { User } from '../../../libs/entities/User';
import ResetButton from '../../Button/ResetButton/ResetButton';
import { convertToDollarString, convertToPercent, convertToXRDString } from '../../../libs/etc/StringOperations';



interface VaultTableProps {
    tableData: Vault[] | undefined;
    isLoading: boolean;
    user: User | undefined;
    isConnected: boolean;
}
const VaultTable: React.FC<VaultTableProps> = ({ tableData, isLoading }) => {

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
    const [roiFilter, setRoiFilter] = useState(Number.MIN_SAFE_INTEGER);
    // const [todayFilter, setTodayFilter] = useState(Number.MIN_SAFE_INTEGER);
    const [activeDaysFilter, setActiveDaysFilter] = useState(Number.MIN_SAFE_INTEGER);
    const [followersFilter, setFollowersFilter] = useState(Number.MIN_SAFE_INTEGER);

    // Filter options
    const totalOptions = [-50, 0, 50, 100, 200];
    // const todayOptions = [-10, 0, 10, 20];
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
        setRoiFilter(Number.MIN_SAFE_INTEGER);
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
                    let aValue = sortOrder === 'asc' ? Number(a[sortedColumn]) : Number(b[sortedColumn]);
                    let bValue = sortOrder === 'asc' ? Number(b[sortedColumn]) : Number(a[sortedColumn]);

                    return aValue - bValue;
                });
            }

            // Apply filtering based on the filter criteria
            filteredEntries = filteredEntries.filter((entry) => {
                const nameMatch = entry.name.toLowerCase().includes(nameFilter.toLowerCase());
                const roiMatch = entry.roi >= roiFilter;
                const activeDaysMatch = entry.activeDays >= activeDaysFilter;
                const followersMatch = entry.followers.length >= followersFilter;

                return nameMatch && roiMatch && activeDaysMatch && followersMatch;
            });
            // Set the sorder and filtered data
            setFilteredData(filteredEntries);

        }
    }, [nameFilter, roiFilter, activeDaysFilter, followersFilter, sortedColumn, sortOrder]);

    return (
        <Box mx={"0px"}>
            <VStack
                divider={<StackDivider borderColor='gray.200' />}
                align='stretch'
            >
                <Box>

                    <Flex>

                        <Spacer />

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
                                    placeholder='ROI'
                                    value={roiFilter}
                                    onChange={setRoiFilter}
                                    options={totalOptions}
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
                                        <Th>ROI</Th>
                                        <Th>Active Days</Th>
                                        <Th>Follower</Th>
                                        <Th>TVL XRD</Th>
                                        <Th>TVL USD</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <Tr key={index}>
                                            <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                                            <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                                            <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                                            <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                                            <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
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
                                        <SortableTh column="roi" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort}>ROI</SortableTh>
                                        <SortableTh column="activeDays" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort} >Active Days</SortableTh>
                                        <SortableTh column="followers" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort}>Followers</SortableTh>
                                        <SortableTh column="tvlInXrd" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort} >TVL XRD</SortableTh>
                                        <SortableTh column="tvlInXrd" sortedColumn={sortedColumn} sortOrder={sortOrder} handleSort={handleSort} >TVL USD</SortableTh>
                                    </Tr>
                                </Thead>
                                <Tbody >
                                    {filteredData?.map((entry, index) => (
                                        <Tr key={index} sx={tableTrStyle}
                                        >
                                            <Td>
                                                <Tooltip label='Go to vault view'>
                                                    <Button
                                                        as={Link}
                                                        href={`/vault/${entry.id}`}
                                                        sx={defaultLinkButtonStyle}
                                                        title={entry.name}
                                                    >
                                                        <IoEnterOutline /><Text pl={"10px"}>{entry.name}</Text>
                                                    </Button>
                                                </Tooltip>
                                            </Td>
                                            <Td color={entry.roi >= 0 ? 'green.500' : 'red.500'}>
                                                {convertToPercent(entry.roi)}
                                            </Td>
                                            <Td>{entry.activeDays}</Td>
                                            <Td>{entry.followers.length}</Td>
                                            <Td>{convertToXRDString(entry.tvlInXrd)}</Td>
                                            <Td>{convertToDollarString(entry.tvlInUsd)}</Td>
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
