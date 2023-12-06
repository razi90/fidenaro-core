import {
    Card,
    Table,
    Text,
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



interface ProfileStatsTableProps {
    totalEquity: any;
    managerPnL: any;
    investorPnL: any;
    totalTrades: any;
    isLoading: boolean;
}

export const ProfileStatsTable: React.FC<ProfileStatsTableProps> = ({ totalEquity, managerPnL, investorPnL, totalTrades, isLoading }) => {

    return (

        <>
            {
                isLoading ? (
                    <Table size="sm">
                        <Tbody>
                            <Tr sx={tableStyle}>
                                <Td><Text fontWeight="bold">Rank</Text></Td>
                                <Td>10</Td>
                            </Tr>
                            <Tr sx={tableStyle}>
                                <Td><Text fontWeight="bold">Total Raised</Text></Td>
                                <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                            </Tr>
                            <Tr sx={tableStyle}>
                                <Td><Text fontWeight="bold">Manager PnL</Text></Td>
                                <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                            </Tr>
                            <Tr sx={tableStyle}>
                                <Td><Text fontWeight="bold">Investor PnL</Text></Td>
                                <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                            </Tr>
                            <Tr sx={tableStyle}>
                                <Td><Text fontWeight="bold">Total Trades</Text></Td>
                                <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
                            </Tr>
                        </Tbody>
                    </Table >
                ) : (
                    <Table size="sm">
                        <Tbody>
                            <Tr sx={tableStyle}>
                                <Td><Text fontWeight="bold">Rank</Text></Td>
                                <Td>10</Td>
                            </Tr>
                            <Tr sx={tableStyle}>
                                <Td><Text fontWeight="bold">Total Raised</Text></Td>
                                <Td>$ {totalEquity}</Td>
                            </Tr>
                            <Tr sx={tableStyle}>
                                <Td><Text fontWeight="bold">Manager PnL</Text></Td>
                                <Td>$ {managerPnL}</Td>
                            </Tr>
                            <Tr sx={tableStyle}>
                                <Td><Text fontWeight="bold">Investor PnL</Text></Td>
                                <Td>$ {investorPnL}</Td>
                            </Tr>
                            <Tr sx={tableStyle}>
                                <Td><Text fontWeight="bold">Total Trades</Text></Td>
                                <Td>{totalTrades}</Td>
                            </Tr>
                        </Tbody>
                    </Table>

                )}


        </>
    );
};
