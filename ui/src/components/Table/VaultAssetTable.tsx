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
} from '@chakra-ui/react';
import React from 'react';
import { CardTitle } from '../Card/CardTitle';
import { tableStyle } from './Styled';
import { USDollar, addressToAsset } from '../../libs/entities/Asset';



interface VaultAssetTable {
    symbol: any;
    coin: any;
    coinAbbreviation: any;
    percentage: any;
    date: any;
}

interface VaultAssetTableProps {
    title: string;
    data: Map<string, number> | undefined;
    isLoading: boolean;
}

export const VaultAssetTable: React.FC<VaultAssetTableProps> = ({ title, data, isLoading }) => {
    return (
        <>
            {
                isLoading ? (
                    <Card w={"50%"} ml={4} p={6} pt={10}>
                        <CardTitle cardTitle={title} isLoading={isLoading} />

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Symbol</Th>
                                    <Th>Coin</Th>
                                    <Th isNumeric>Amount</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Tr sx={tableStyle} key={index}>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='3' skeletonHeight='2' /></Td>
                                        <Td>
                                            <SkeletonText mt='2' noOfLines={2} spacing='3' skeletonHeight='2' />
                                        </Td>
                                        <Td isNumeric>
                                            <SkeletonText mt='2' noOfLines={2} spacing='3' skeletonHeight='2' />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                            <Tfoot>
                                <Tr>
                                    <Th>Symbol</Th>
                                    <Th>Coin</Th>
                                    <Th isNumeric>Amount</Th>
                                </Tr>
                            </Tfoot>
                        </Table>
                    </Card >
                ) : (
                    <Card w={"50%"} ml={4} p={6} pt={10}>
                        <CardTitle cardTitle={title} isLoading={isLoading} />

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Symbol</Th>
                                    <Th>Coin</Th>
                                    <Th isNumeric>Amount</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {
                                    Array.from(data!.entries()).map(([key, value]) => {
                                        const asset = addressToAsset(key);
                                        let displayValue: string = value.toString();

                                        if (typeof value === 'number' && key === USDollar.address) {
                                            displayValue = value.toFixed(2);
                                        } else {
                                            displayValue = value.toString();
                                        }

                                        return (
                                            <Tr sx={tableStyle} key={key}>
                                                <Td>{asset.symbol}</Td>
                                                <Td>
                                                    {asset.name} ({asset.ticker})
                                                </Td>
                                                <Td isNumeric>
                                                    {displayValue}
                                                </Td>
                                            </Tr>
                                        );
                                    })
                                }
                            </Tbody>
                            <Tfoot>
                                <Tr>
                                    <Th>Symbol</Th>
                                    <Th>Coin</Th>
                                </Tr>
                            </Tfoot>
                        </Table>
                    </Card >
                )}


        </>
    );
};
