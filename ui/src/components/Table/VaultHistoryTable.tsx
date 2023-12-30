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
import { Trade } from '../../libs/entities/Vault';
import { convertToDollarString } from '../../libs/etc/StringOperations';

interface VaultHistoryTableProps {
    title: string;
    data: Trade[] | undefined;
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
                        <CardTitle cardTitle={title} isLoading={isLoading} />

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Time</Th>
                                    <Th>Action</Th>
                                    <Th>From</Th>
                                    <Th isNumeric> Amount</Th>
                                    <Th>To</Th>
                                    <Th isNumeric>Amount </Th>
                                    <Th isNumeric>Price</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Tr sx={tableStyle} key={index}>
                                        <Td isNumeric>
                                            <Text><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Text>
                                        </Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                        <Td isNumeric>
                                            <Text><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Text>
                                        </Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                        <Td isNumeric>
                                            <Text><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Text>
                                        </Td>
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
                                    <Th>From</Th>
                                    <Th isNumeric> Amount</Th>
                                    <Th>To</Th>
                                    <Th isNumeric>Amount </Th>
                                    <Th isNumeric>Price</Th>
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
                                    <Th>From</Th>
                                    <Th isNumeric> Amount</Th>
                                    <Th>To</Th>
                                    <Th isNumeric>Amount </Th>
                                    <Th isNumeric>Price</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.map((item, index) => (
                                    <Tr sx={tableStyle} key={index}>
                                        <Td>{item.timestamp}</Td>
                                        <Td>{item.action}</Td>
                                        <Td>{item.from.ticker}</Td>
                                        <Td isNumeric>{item.from_amount}</Td>
                                        <Td>{item.to.ticker}</Td>
                                        <Td isNumeric>{item.to_amount}</Td>
                                        <Td isNumeric>{convertToDollarString(item.price)}</Td>
                                        {/* <Td>
                                            <RadixTansactionLink content={item.transaction} />
                                        </Td> */}
                                    </Tr>
                                ))}
                            </Tbody>
                            <Tfoot>
                                <Tr>
                                    <Th>Time</Th>
                                    <Th>Action</Th>
                                    <Th>From</Th>
                                    <Th isNumeric> Amount</Th>
                                    <Th>To</Th>
                                    <Th isNumeric>Amount </Th>
                                    <Th isNumeric>Price</Th>
                                </Tr>
                            </Tfoot>
                        </Table>
                    </Card >
                )}


        </>
    );
};
