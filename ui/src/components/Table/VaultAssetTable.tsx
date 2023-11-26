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



interface VaultAssetTable {
    symbol: any;
    coin: any;
    coinAbbreviation: any;
    percentage: any;
    date: any;
}

interface VaultAssetTableProps {
    title: string;
    data: VaultAssetTable[] | undefined;
    isLoading: boolean;
}

export const VaultAssetTable: React.FC<VaultAssetTableProps> = ({ title, data, isLoading }) => {

    return (




        <>
            {
                isLoading ? (
                    <Card w={"50%"} ml={4} p={6} pt={10}>
                        <CardTitle cardTitle={title} />

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Symbol</Th>
                                    <Th>Coin</Th>
                                    <Th isNumeric>Percentage</Th>
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
                                    <Th isNumeric>Percentage</Th>
                                </Tr>
                            </Tfoot>
                        </Table>
                    </Card >
                ) : (
                    <Card w={"50%"} ml={4} p={6} pt={10}>
                        <CardTitle cardTitle={title} />

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Symbol</Th>
                                    <Th>Coin</Th>
                                    <Th isNumeric>Percentage</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.map((item, index) => (
                                    <Tr sx={tableStyle} key={index}>
                                        <Td>{item.symbol}</Td>
                                        <Td>
                                            {item.coin}
                                            {item.coinAbbreviation}
                                        </Td>
                                        <Td isNumeric>
                                            {item.percentage}
                                            {item.date}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                            <Tfoot>
                                <Tr>
                                    <Th>Symbol</Th>
                                    <Th>Coin</Th>
                                    <Th isNumeric>Percentage</Th>
                                </Tr>
                            </Tfoot>
                        </Table>
                    </Card >
                )}


        </>
    );
};
