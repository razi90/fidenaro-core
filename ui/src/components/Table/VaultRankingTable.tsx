import {
    Card,
    Table,
    Thead,
    Th,
    Tr,
    Td,
    Tbody,
    SkeletonText,
    useColorModeValue
} from '@chakra-ui/react';
import React from 'react';
import { CardTitle } from '../Card/CardTitle';
import { tableStyle } from './Styled';
import { Vault } from '../../libs/entities/Vault';
import PnlText from '../Text/PnlText';
import { FidenaroIcon } from '../Icon/FidenaroIcon';
import { FaCrown, FaHeart } from 'react-icons/fa';

interface VaultRankingTableProps {
    title: string;
    data: Vault[] | undefined;
    userId: string;
    isLoading: boolean;
}

export const VaultRankingTable: React.FC<VaultRankingTableProps> = ({ title, userId, data, isLoading }) => {

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
                                    <Th>Rank</Th>
                                    <Th>Name</Th>
                                    <Th>Manager</Th>
                                    <Th>PnL</Th>
                                    <Th></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Tr sx={tableStyle} key={index}>
                                        <Td> <SkeletonText mt='2' noOfLines={2} spacing='3' skeletonHeight='2' /></Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                        <Td><SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' /></Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Card >
                ) : (
                    <Card bg={bgColor} p={6} pt={10}>
                        <CardTitle cardTitle={title} isLoading={isLoading} />

                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Rank</Th>
                                    <Th>Name</Th>
                                    <Th>Manager</Th>
                                    <Th>PnL</Th>
                                    <Th></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.slice(3, 10).map((item, index) => {
                                    const isManager = item.manager.id === userId;
                                    const isFollower = item.followers.includes(userId);
                                    const userRole = isManager
                                        ? 'Manager'
                                        : isFollower
                                            ? 'Follower'
                                            : null;
                                    return (
                                        <Tr sx={tableStyle} key={index}>
                                            <Td>{index + 4}</Td>
                                            <Td>{item.name}</Td>
                                            <Td>{item.manager.name}</Td>
                                            <Td><PnlText value={item.calculatePnL()} /> </Td>
                                            <Td>
                                                {
                                                    userRole
                                                    &&
                                                    <FidenaroIcon icon={isManager ? FaCrown : FaHeart} color="pElement.200" />
                                                }
                                            </Td>
                                        </Tr>
                                    )
                                })}
                            </Tbody>
                        </Table>
                    </Card >
                )}
        </>
    );
};
