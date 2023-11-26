import { Box, Flex, Heading, Text, SkeletonText, Skeleton } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { descriptionCardStyle } from './Styled';

interface DescriptionCardProps {
    children: ReactNode;
    title: string;
    isLoading: boolean;
}

export const DescriptionCard: React.FC<DescriptionCardProps> = ({ children, title, isLoading }) => {

    return (
        <>
            {
                isLoading ? (

                    <Box flex='1' sx={descriptionCardStyle}>
                        <SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' />
                    </Box >
                ) : (
                    <Flex flex='1' sx={descriptionCardStyle}>
                        <Box w={"100%"} >
                            <Heading size='xs' textTransform='uppercase'>
                                {title}
                            </Heading>

                            <Text>
                                {children}
                            </Text>
                        </Box>
                    </Flex>
                )}
        </>
    );
};
