import {
    Card,
    Table,
    Thead,
    Th,
    Tr,
    Td,
    Tbody,
    Tfoot,
    SkeletonText,
    Stack,
    VStack,
    Box,
    useColorMode,
    useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import Chart from "react-apexcharts";
import { CardTitle } from '../Card/CardTitle';
import { tableStyle } from './Styled';
import { addressToAsset } from '../../libs/entities/Asset';
import { AssetStats } from '../../libs/entities/Vault';
import { convertToDollarString, convertToXRDString } from '../../libs/etc/StringOperations';
import { ApexOptions } from 'apexcharts';

interface VaultAssetTableProps {
    title: string;
    data: Map<string, AssetStats> | undefined;
    isLoading: boolean;
    isMobileLayout: boolean;
}

export const VaultAssetTable: React.FC<VaultAssetTableProps> = ({ title, data, isLoading, isMobileLayout }) => {
    const { colorMode } = useColorMode();  // Get the current color mode (dark or light)
    const bgColor = useColorModeValue("white", "#161616");

    const renderTable = () => (
        <Box bg={bgColor} overflowX={isMobileLayout ? "auto" : "visible"}>
            <Table size="sm" minW={isMobileLayout ? "600px" : "auto"}>
                <Thead>
                    <Tr>
                        <Th>Symbol</Th>
                        <Th>Coin</Th>
                        <Th isNumeric>Amount</Th>
                        <Th isNumeric>Value XRD</Th>
                        <Th isNumeric>Value USD</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {isLoading
                        ? Array.from({ length: 5 }).map((_, index) => renderRow(index))
                        : Array.from(data!.entries()).map(([key, value]) => renderRow(key, value))}
                </Tbody>
                <Tfoot>
                    <Tr>
                        <Th>Symbol</Th>
                        <Th>Coin</Th>
                        <Th isNumeric>Amount</Th>
                        <Th isNumeric>Value XRD</Th>
                        <Th isNumeric>Value USD</Th>
                    </Tr>
                </Tfoot>
            </Table>
        </Box>
    );

    const renderRow = (key: string | number, value?: AssetStats) => {
        if (isLoading) {
            return (
                <Tr sx={tableStyle} key={key}>
                    <Td><SkeletonText mt="2" noOfLines={2} spacing="3" skeletonHeight="2" /></Td>
                    <Td><SkeletonText mt="2" noOfLines={2} spacing="3" skeletonHeight="2" /></Td>
                    <Td isNumeric><SkeletonText mt="2" noOfLines={2} spacing="3" skeletonHeight="2" /></Td>
                    <Td isNumeric><SkeletonText mt="2" noOfLines={2} spacing="3" skeletonHeight="2" /></Td>
                    <Td isNumeric><SkeletonText mt="2" noOfLines={2} spacing="3" skeletonHeight="2" /></Td>
                </Tr>
            );
        } else {
            const asset = addressToAsset(key as string);
            const amount = typeof value?.amount === 'number' ? value.amount.toFixed(5) : "0.00";
            return (
                <Tr sx={tableStyle} key={key}>
                    <Td>{asset.symbol}</Td>
                    <Td>{asset.name} ({asset.ticker})</Td>
                    <Td isNumeric>{amount}</Td>
                    <Td isNumeric>{convertToXRDString(value?.valueInXRD)}</Td>
                    <Td isNumeric>{convertToDollarString(value?.valueInUSD)}</Td>
                </Tr>
            );
        }
    };

    const pieChartData = data ? Array.from(data.values()).map(value => value.valueInUSD) : [];
    const legendTextColor = colorMode === 'dark' ? '#F8F8F8' : '#000000';  // Legend text color based on color mode

    const pieChartOptions: ApexOptions = {
        chart: {
            type: 'pie',
        },
        labels: data ? Array.from(data.keys()).map(key => addressToAsset(key as string).ticker) : [],
        responsive: [{
            breakpoint: 100,
            options: {
                chart: {
                    width: '100%', // Ensure the chart takes the full width of its container on mobile
                },
                legend: {
                    position: 'bottom'
                }
            }
        }],
        legend: {
            position: 'right',
            offsetY: 0,
            height: 230,
            labels: {
                colors: legendTextColor,
            },
        },
    };

    const renderChart = () => (
        <Chart
            options={pieChartOptions}
            series={pieChartData}
            type="pie"
            width={isMobileLayout ? "100%" : "100%"} // Use "100%" width for both mobile and desktop, or adjust accordingly
            height={isMobileLayout ? "250" : "350"}  // Adjust the height to make it more appropriate on mobile
        />
    );

    return (
        <Card bg={bgColor} p={6} pt={10}>
            <CardTitle cardTitle={title} isLoading={isLoading} />
            {isMobileLayout ? (
                <VStack spacing={8} align="stretch">
                    <Card w="100%">
                        {renderTable()}
                    </Card>
                    <Card bg={bgColor} w="100%" display="flex" justifyContent="center" alignItems="center">
                        {renderChart()}
                    </Card>
                </VStack>
            ) : (
                <Stack direction="row" spacing={8}>
                    <Card w="50%">
                        {renderTable()}
                    </Card>
                    <Card bg={bgColor} w="50%" display="flex" justifyContent="center" alignItems="center">
                        {renderChart()}
                    </Card>
                </Stack>
            )}
        </Card>
    );
};
