import {
    Flex,
    Heading,
    Stat,
    StatLabel,
    StatNumber,
    StatArrow,
    SkeletonText,
    Box,
    Center,
} from '@chakra-ui/react';
import React from 'react';
import { statCardStyle } from './Styled';


interface StatCardProps {
    value: string;
    title: string;
    isLoading: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ value, title, isLoading }) => {

    return (
        <>
            {
                isLoading ? (

                    <Box sx={statCardStyle}>
                        <SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' />
                    </Box >
                ) : (

                    <Flex flexWrap='wrap' sx={statCardStyle}>
                        <Center>
                            <Stat>
                                <StatLabel>
                                    <Heading size='xs' textTransform='uppercase'>
                                        {title}
                                    </Heading>
                                </StatLabel>
                                <StatNumber><StatArrow type='increase' />{value}  </StatNumber>
                            </Stat>
                        </Center>
                    </Flex>
                )}
        </>
    );
};
