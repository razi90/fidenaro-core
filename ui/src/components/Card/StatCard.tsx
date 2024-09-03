import React from 'react';
import {
    Flex,
    Heading,
    Stat,
    StatLabel,
    StatNumber,
    StatArrow,
    SkeletonText,
    Box,
} from '@chakra-ui/react';
import { statCardStyle } from './Styled';

interface StatCardProps {
    value: string;
    title: string;
    isLoading: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ value, title, isLoading }) => {
    const isNegative = value.startsWith('-');
    const arrowType = isNegative ? 'decrease' : 'increase';

    return (
        <>
            {isLoading ? (
                <Box sx={statCardStyle}>
                    <SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' />
                </Box>
            ) : (
                <Flex flexWrap='wrap' sx={statCardStyle} alignItems="center" justifyContent="center">
                    <Stat textAlign="center">
                        <StatLabel>
                            <Heading size='xs' textTransform='uppercase'>
                                {title}
                            </Heading>
                        </StatLabel>
                        <StatNumber display="flex" justifyContent="center" alignItems="center">
                            <StatArrow type={arrowType} />
                            {value}
                        </StatNumber>
                    </Stat>
                </Flex>
            )}
        </>
    );
};
