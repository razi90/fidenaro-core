import {
    Card,
    Table,
    Thead,
    Th,
    Tr,
    Td,
    Tbody,
    Tfoot,
    Link,
    SkeletonText,
    Box,
    useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import { CardTitle } from '../Card/CardTitle';
import { tableStyle } from './Styled';
import { convertTimeStamp } from '../../libs/etc/StringOperations';
import { TradeEventData } from '../../libs/transaction/TransactionDataService';

interface VaultHistoryTableProps {
    title: string;
    data: TradeEventData[] | undefined;
    isLoading: boolean;
    isMobileLayout: boolean; // Pass the layout mode to adjust for mobile
}

interface RadixTransactionLinkProps {
    content: string;
}

const RadixTransactionLink: React.FC<RadixTransactionLinkProps> = ({ content }) => {
    const truncatedContent = content.substring(0, 22) + (content.length > 22 ? '...' : '');

    return (
        <Link
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            title={content}
            href={`https://dashboard.radixdlt.com/transaction/${content}/summary`}
        >
            {truncatedContent}
        </Link>
    );
};

export const VaultHistoryTable: React.FC<VaultHistoryTableProps> = ({ title, data, isLoading, isMobileLayout }) => {

    const bgColor = useColorModeValue("white", "#161616");

    const renderTableRows = () => (
        <>
            <Thead>
                <Tr>
                    <Th>Time</Th>
                    <Th>From</Th>
                    <Th isNumeric> Amount</Th>
                    <Th>To</Th>
                    <Th isNumeric>Amount </Th>
                </Tr>
            </Thead>
            <Tbody>
                {isLoading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <Tr sx={tableStyle} key={index}>
                            <Td isNumeric><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                            <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                            <Td isNumeric><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                            <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                            <Td isNumeric><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                        </Tr>
                    ))
                    : data?.map((item, index) => (
                        <Tr sx={tableStyle} key={index}>
                            <Td>{convertTimeStamp(item.round_timestamp)}</Td>
                            <Td>{item.trade_details.from.ticker}</Td>
                            <Td isNumeric>{item.trade_details.from_amount}</Td>
                            <Td>{item.trade_details.to.ticker}</Td>
                            <Td isNumeric>{item.trade_details.to_amount}</Td>
                        </Tr>
                    ))}
            </Tbody>
            <Tfoot>
                <Tr>
                    <Th>Time</Th>
                    <Th>From</Th>
                    <Th isNumeric> Amount</Th>
                    <Th>To</Th>
                    <Th isNumeric>Amount </Th>
                </Tr>
            </Tfoot>
        </>
    );

    return (
        <Card bg={bgColor} p={6} pt={10}>
            <CardTitle cardTitle={title} isLoading={isLoading} />
            <Box overflowX={isMobileLayout ? "auto" : "visible"}>
                <Table size="sm" minW={isMobileLayout ? "600px" : "auto"}>
                    {renderTableRows()}
                </Table>
            </Box>
        </Card>
    );
};
