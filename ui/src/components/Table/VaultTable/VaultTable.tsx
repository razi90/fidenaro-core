import React, { useState, useEffect, Fragment } from 'react';
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
    VStack,
    Collapse,
    Input,
    Link,
    Tooltip,
    Button,
    useBreakpointValue,
    HStack,
    Spacer,
    Divider
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
    const [activeDaysFilter, setActiveDaysFilter] = useState(Number.MIN_SAFE_INTEGER);
    const [followersFilter, setFollowersFilter] = useState(Number.MIN_SAFE_INTEGER);

    // Filter options
    const totalOptions = [-50, 0, 50, 100, 200];
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

    const isMobile = useBreakpointValue({ base: true, md: false });

    return (
        <Box mx={"0px"}>
            <VStack
                align='stretch'
            >
                {/* Filter Section */}
                <Box>
                    <Flex>
                        <Spacer />
                        <HStack>
                            <ResetButton onClick={resetFilters} />
                            <Spacer />
                            <FilterButton onClick={handleToggle} showSection />
                        </HStack>
                    </Flex>

                    <Box>
                        <Collapse in={showSection} animateOpacity>
                            <Flex direction={isMobile ? "column" : "row"}>
                                <Input
                                    placeholder='Name'
                                    value={nameFilter}
                                    onChange={(e) => setNameFilter(e.target.value)}
                                    mb={isMobile ? 2 : 0}
                                />
                                <FilterSelect
                                    placeholder='ROI'
                                    value={roiFilter}
                                    onChange={setRoiFilter}
                                    options={totalOptions}
                                    is_percent={true}
                                    mb={isMobile ? 2 : 0}
                                />
                                <FilterSelect
                                    placeholder='Active days'
                                    value={activeDaysFilter}
                                    onChange={setActiveDaysFilter}
                                    options={activeDaysOptions}
                                    is_percent={false}
                                    mb={isMobile ? 2 : 0}
                                />
                                <FilterSelect
                                    placeholder='Followers'
                                    value={followersFilter}
                                    onChange={setFollowersFilter}
                                    options={followersOptions}
                                    is_percent={false}
                                    mb={isMobile ? 2 : 0}
                                />
                            </Flex>
                        </Collapse>
                    </Box>
                </Box>

                {/* Conditional Rendering for Desktop and Mobile Views */}
                {isMobile ? (
                    <VStack spacing={4} align="stretch">
                        {filteredData?.map((entry, index) => (
                            <Fragment key={index}>
                                <Box
                                    key={index}
                                    p={4}
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    overflow="hidden"
                                    sx={tableTrStyle}
                                >
                                    <Flex direction="column">
                                        <Tooltip label='Go to vault view'>
                                            <Button
                                                as={Link}
                                                href={`/vault/${entry.id}`}
                                                sx={defaultLinkButtonStyle}
                                                title={entry.name}
                                                w="100%"
                                                textAlign="left"
                                            >
                                                <IoEnterOutline />
                                                <Text pl={"10px"}>{entry.name}</Text>
                                            </Button>
                                        </Tooltip>
                                        <Box mt={4}>
                                            <Flex justifyContent="space-between">
                                                <Text>ROI:</Text>
                                                <Text color={entry.roi >= 0 ? 'green.500' : 'red.500'}>
                                                    {convertToPercent(entry.roi)}
                                                </Text>
                                            </Flex>
                                            <Flex justifyContent="space-between">
                                                <Text>Active Days:</Text>
                                                <Text>{entry.activeDays}</Text>
                                            </Flex>
                                            <Flex justifyContent="space-between">
                                                <Text>Followers:</Text>
                                                <Text>{entry.followers.length}</Text>
                                            </Flex>
                                            <Flex justifyContent="space-between">
                                                <Text>TVL XRD:</Text>
                                                <Text>{convertToXRDString(entry.tvlInXrd)}</Text>
                                            </Flex>
                                            <Flex justifyContent="space-between">
                                                <Text>TVL USD:</Text>
                                                <Text>{convertToDollarString(entry.tvlInUsd)}</Text>
                                            </Flex>
                                        </Box>
                                    </Flex>
                                </Box>
                                {index < filteredData.length - 1 && <Divider />}
                            </Fragment>
                        ))}
                    </VStack>
                ) : (
                    <TableContainer>
                        <Table size="sm">
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
                                    <Tr key={index} sx={tableTrStyle}>
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
                    </TableContainer>
                )}
            </VStack>
        </Box>
    );
};

export default VaultTable;
