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
    SkeletonText,
    useColorModeValue
} from '@chakra-ui/react';
import React from 'react';
import { CardTitle } from '../Card/CardTitle';
import { tableStyle } from './Styled';
import { convertToXRDString, formatUnixTimestampToUTC } from '../../libs/etc/StringOperations';
import { Transaction } from '../../libs/transaction/TransactionDataService';

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

    const bgColor = useColorModeValue("white", "#161616");

    return (
        <>
            {
                isLoading ? (
                    <Card bg={bgColor} p={6} pt={10}>
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
                    <Card bg={bgColor} p={6} pt={10}>
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
                                        <Td isNumeric >
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
