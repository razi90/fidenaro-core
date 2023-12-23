import {
    Box,
    Flex,
    Heading,
    Text,
    SkeletonText,
} from '@chakra-ui/react';
import React from 'react';
import { valueCardStyle } from './Styled';


interface ValueCardProps {
    value: any;
    description: string;
    isLoading: boolean;
}

export const ValueCard: React.FC<ValueCardProps> = ({ value, description, isLoading }) => {

    return (
        <>
            {
                isLoading ? (

                    <Box flex='1' flexWrap='wrap' sx={valueCardStyle}>
                        <SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' />
                    </Box >
                ) : (
                    <Flex flex='1' flexWrap='wrap' sx={valueCardStyle}>
                        <Box w={"100%"}>
                            <Heading size='md' textAlign="center">{value}</Heading>
                            <Text textAlign="center">{description}</Text>
                        </Box>
                    </Flex>
                )}
        </>
    );
};
