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
} from '@chakra-ui/react';
import React from 'react';
import Chart from "react-apexcharts";
import { CardTitle } from '../Card/CardTitle';
import { tableStyle } from './Styled';
import { addressToAsset } from '../../libs/entities/Asset';
import { AssetStats } from '../../libs/entities/Vault';
import { convertToDollarString, convertToXRDString } from '../../libs/etc/StringOperations';
import { ApexOptions } from 'apexcharts';


interface VaultAssetTable {
    symbol: any;
    coin: any;
    coinAbbreviation: any;
    percentage: any;
    date: any;
}

interface VaultAssetTableProps {
    title: string;
    data: Map<string, AssetStats> | undefined;
    isLoading: boolean;
}


export const VaultAssetTable: React.FC<VaultAssetTableProps> = ({ title, data, isLoading }) => {
    const pieChartOptions: ApexOptions = {
        chart: {
            type: 'pie',
        },
        labels: data ? Array.from(data.keys()).map(key => addressToAsset(key as string).ticker) : [],
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
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
        },
    };

    const pieChartData = data ? Array.from(data.values()).map(value => value.valueInUSD) : [];


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

    return (
        <Card w="100%" ml={4} p={6} pt={10}>
            <CardTitle cardTitle={title} isLoading={isLoading} />
            <Stack direction="row" spacing={8}>
                <Card w="50%">
                    <Table size="sm">
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
                </Card>
                <Card w="50%" display="flex" justifyContent="center" alignItems="center">
                    <Chart
                        options={pieChartOptions}
                        series={pieChartData}
                        type="pie"
                        width="150%"
                        height="350"
                    />
                </Card>
            </Stack>
        </Card>
    );
};
