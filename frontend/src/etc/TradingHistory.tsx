import React from 'react';
import {
    Box, Text, List, ListItem, Flex,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Heading,
} from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';

interface Trade {
    date: string;
    entry: string;
    close: string;
    direction: string;
    leverage: string;
    pnl: string;
    fee: string;
}

interface TradingHistoryProps {
    trades: Trade[];
}

const TradingHistory: React.FC<TradingHistoryProps> = ({ trades }) => {
    return (
        <Box mt={4} textAlign="center">
            <Heading size='md'>Trading History</Heading>
            <TableContainer>
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>Date</Th>
                            <Th>Entry</Th>
                            <Th>Close</Th>
                            <Th>Direction</Th>
                            <Th>Leverage</Th>
                            <Th>PnL $</Th>
                            <Th>Fee $</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {trades.map((trade, index) => (
                            <Tr key={index}>
                                <Td>{trade.date}</Td>
                                <Td>{trade.entry}</Td>
                                <Td>{trade.close}</Td>
                                <Td>
                                    <Text color={trade.direction === 'Long' ? 'green.500' : 'red.500'}>
                                        {trade.direction === 'Long' ? (
                                            <Box display="flex" alignItems="center">
                                                <Text>Long  </Text>
                                                <ArrowUpIcon boxSize={4} />
                                            </Box>
                                        ) : (
                                            <Box display="flex" alignItems="center">
                                                <Text>Short  </Text>
                                                <ArrowDownIcon boxSize={4} />
                                            </Box>
                                        )}
                                    </Text>
                                </Td>
                                <Td>{trade.leverage}</Td>
                                <Td color={parseFloat(trade.pnl) >= 0 ? 'green.500' : 'red.500'}>
                                    {trade.pnl}
                                </Td>
                                <Td>{trade.fee}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TradingHistory;
