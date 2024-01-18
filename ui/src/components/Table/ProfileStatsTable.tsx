import {
    Table,
    Text,
    Tr,
    Td,
    Tbody,
    SkeletonText,
} from '@chakra-ui/react';
import React from 'react';
import { tableStyle } from './Styled';



interface ProfileStatsTableProps {
    rank: any;
    totalEquity: any;
    managerPnL: any;
    investorPnL: any;
    totalTrades: any;
    isLoading: boolean;
}

export const ProfileStatsTable: React.FC<ProfileStatsTableProps> = ({ rank, totalEquity, managerPnL, investorPnL, totalTrades, isLoading }) => {

    return (

        <>
            {
                isLoading ? (
                    <Table size="sm">
                        <Tbody>
                            <Tr sx={tableStyle}>
                                <Td><Text fontWeight="bold">Rank</Text></Td>
                                <Td><SkeletonText mt='2' noOfLines={1} spacing='3' skeletonHeight='2' /></Td>
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
                                <Td>{rank}</Td>
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

                )
            }
        </>
    );
};
