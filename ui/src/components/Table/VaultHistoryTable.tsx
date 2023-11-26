import {
    Card,
    Table,
    Thead,
    Th,
    Tr,
    Td,
    Tbody,
    Tfoot,
    Text,
    Link,
    SkeletonText
} from '@chakra-ui/react';
import React from 'react';
import { CardTitle } from '../Card/CardTitle';
import { tableStyle } from './Styled';
import { VaultHistory } from '../../libs/entities/Vault';

interface VaultHistoryTableProps {
    title: string;
    data: VaultHistory[] | undefined;
    isLoading: boolean;
}

interface RadixTansactionLinkProps {
    content: string;
}

const RadixTansactionLink: React.FC<RadixTansactionLinkProps> = ({ content }) => {
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

export const VaultHistoryTable: React.FC<VaultHistoryTableProps> = ({ title, data, isLoading }) => {

    return (
        <>
            {
                isLoading ? (
                    <Card p={6} pt={10}>
                        <CardTitle cardTitle={title} />

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Symbol</Th>
                                    <Th>Call</Th>
                                    <Th>Amount</Th>
                                    <Th>Total USD</Th>
                                    <Th isNumeric>Open </Th>
                                    <Th isNumeric>Close</Th>
                                    <Th >Transaction</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Tr sx={tableStyle} key={index}>
                                        <Td> <SkeletonText mt='2' noOfLines={2} spacing='3' skeletonHeight='2' /></Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                        <Td isNumeric>
                                            <Text><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Text>
                                        </Td>
                                        <Td isNumeric>
                                            <Text><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Text>
                                        </Td>
                                        <Td>
                                            <SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                            <Tfoot>
                                <Tr>
                                    <Th>Symbol</Th>
                                    <Th>Call</Th>
                                    <Th>Amount</Th>
                                    <Th>Total USD</Th>
                                    <Th isNumeric>Open </Th>
                                    <Th isNumeric>Close</Th>
                                    <Th>Transaction</Th>
                                </Tr>
                            </Tfoot>
                        </Table>
                    </Card >
                ) : (
                    <Card p={6} pt={10}>
                        <CardTitle cardTitle={title} />

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Symbol</Th>
                                    <Th>Call</Th>
                                    <Th>Amount</Th>
                                    <Th>Total USD</Th>
                                    <Th isNumeric>Open </Th>
                                    <Th isNumeric>Close</Th>
                                    <Th >Transaction</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.map((item, index) => (
                                    <Tr sx={tableStyle} key={index}>
                                        <Td>{item.symbol}</Td>
                                        <Td>{item.call}</Td>
                                        <Td>{item.amount}</Td>
                                        <Td>{item.totalUSD}</Td>
                                        <Td isNumeric>
                                            <Text>{item.open}</Text>
                                            <Text fontSize="xs">{item.openDate}</Text>
                                        </Td>
                                        <Td isNumeric>
                                            <Text>{item.close}</Text>
                                            <Text fontSize="xs">{item.closeDate}</Text>
                                        </Td>
                                        <Td>
                                            <RadixTansactionLink content={item.transaction} />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                            <Tfoot>
                                <Tr>
                                    <Th>Symbol</Th>
                                    <Th>Call</Th>
                                    <Th>Amount</Th>
                                    <Th>Total USD</Th>
                                    <Th isNumeric>Open </Th>
                                    <Th isNumeric>Close</Th>
                                    <Th>Transaction</Th>
                                </Tr>
                            </Tfoot>
                        </Table>
                    </Card >
                )}


        </>
    );
};
