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
import { Transaction } from '../../libs/entities/Vault';
import { convertToXRDString, formatUnixTimestampToUTC } from '../../libs/etc/StringOperations';

interface VaultFlowHistoryTableProps {
    title: string;
    data: Transaction[] | undefined;
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

export const VaultFlowHistoryTable: React.FC<VaultFlowHistoryTableProps> = ({ title, data, isLoading }) => {

    return (
        <>
            {
                isLoading ? (
                    <Card p={6} pt={10}>
                        <CardTitle cardTitle={title} isLoading={isLoading} />

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Time</Th>
                                    <Th>Action</Th>
                                    <Th isNumeric> Amount</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Tr sx={tableStyle} key={index}>
                                        <Td isNumeric>
                                            <Text><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Text>
                                        </Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                        <Td isNumeric>
                                            <Text><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Text>
                                        </Td>

                                    </Tr>
                                ))}
                            </Tbody>
                            <Tfoot>
                                <Tr>
                                    <Th>Time</Th>
                                    <Th>Action</Th>
                                    <Th isNumeric> Amount</Th>
                                </Tr>
                            </Tfoot>
                        </Table>
                    </Card >
                ) : (
                    <Card p={6} pt={10}>
                        <CardTitle cardTitle={title} isLoading={isLoading} />

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Time</Th>
                                    <Th>Action</Th>
                                    <Th isNumeric> Amount</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.map((item, index) => (
                                    <Tr sx={tableStyle} key={index}>
                                        <Td>{formatUnixTimestampToUTC(item.unixTimestamp)}</Td>
                                        <Td>{item.action}</Td>
                                        <Td isNumeric style={{ color: item.action === 'Withdrawal' ? 'red' : 'black' }}>
                                            {item.action === 'Withdrawal' ?
                                                `- ${convertToXRDString(item.amount)}` :
                                                convertToXRDString(item.amount)
                                            }
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>

                            <Tfoot>
                                <Tr>
                                    <Th>Time</Th>
                                    <Th>Action</Th>
                                    <Th isNumeric> Amount</Th>
                                </Tr>
                            </Tfoot>
                        </Table>
                    </Card >
                )
            }
        </>
    );
};
