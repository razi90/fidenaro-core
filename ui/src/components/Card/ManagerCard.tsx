import { Box, Flex, Heading, Text, Avatar, SkeletonCircle, SkeletonText } from '@chakra-ui/react';
import { descriptionCardStyle } from './Styled';

interface ManagerCardProps {
    name: string;
    imageLink: string;
    isLoading: boolean;
}

export const ManagerCard: React.FC<ManagerCardProps> = ({ name, imageLink, isLoading }) => {

    return (
        <>
            {
                isLoading ? (
                    <Flex flex='1' gap='4' alignItems='center' flexWrap='wrap' bg='white' sx={descriptionCardStyle} >
                        <SkeletonCircle size='12' />
                        <Box>
                            <SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' />
                        </Box>
                    </Flex >

                ) : (
                    <Flex flex='1' gap='4' alignItems='center' flexWrap='wrap' sx={descriptionCardStyle}>
                        <Avatar name={name} src={imageLink} />

                        <Box>
                            <Heading size='xs' textTransform='uppercase'>Vault Manager</Heading>
                            <Text>{name}</Text>
                        </Box>
                    </Flex>
                )}
        </>

    );
};
