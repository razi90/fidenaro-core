import {
    Card,
    Table,
    Thead,
    Th,
    Tr,
    Td,
    Tbody,
    SkeletonText
} from '@chakra-ui/react';
import React from 'react';
import { CardTitle } from '../Card/CardTitle';
import { tableStyle } from './Styled';
import { Vault } from '../../libs/entities/Vault';
import PnlText from '../Text/PnlText';

interface VaultRankingTableProps {
    title: string;
    data: Vault[] | undefined;
    isLoading: boolean;
}

export const VaultRankingTable: React.FC<VaultRankingTableProps> = ({ title, data, isLoading }) => {

    return (
        <>
            {
                isLoading ? (
                    <Card p={6} pt={10}>
                        <CardTitle cardTitle={title} isLoading={isLoading} />

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Rank</Th>
                                    <Th>Name</Th>
                                    <Th>Manager</Th>
                                    <Th>PnL</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Tr sx={tableStyle} key={index}>
                                        <Td> <SkeletonText mt='2' noOfLines={2} spacing='3' skeletonHeight='2' /></Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Card >
                ) : (
                    <Card p={6} pt={10}>
                        <CardTitle cardTitle={title} isLoading={isLoading} />

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Rank</Th>
                                    <Th>Name</Th>
                                    <Th>Manager</Th>
                                    <Th>PnL</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.slice(3, 10).map((item, index) => (
                                    <Tr sx={tableStyle} key={index}>
                                        <Td>{index + 4}</Td>
                                        <Td>{item.name}</Td>
                                        <Td>{item.manager.name}</Td>
                                        <Td><PnlText value={item.calculatePnL()} /> </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Card >
                )}
        </>
    );
};
