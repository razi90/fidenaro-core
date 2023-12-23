import { Box, Flex, Text, SkeletonText, Tooltip, Link } from '@chakra-ui/react';
import { descriptionCardStyle } from './Styled';

interface LinkCardProps {
    name: string;
    tooltip: string;
    urlLink: string;
    isLoading: boolean;
}

export const LinkCard: React.FC<LinkCardProps> = ({ name, tooltip, urlLink, isLoading }) => {

    return (
        <>
            {
                isLoading ? (
                    <Flex flex='1' gap='4' alignItems='center' flexWrap='wrap' bg='white' sx={descriptionCardStyle} >
                        <Box>
                            <SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' />
                        </Box>
                    </Flex >

                ) : (
                    <Tooltip label={tooltip}>
                        <Flex as={Link} href={urlLink} title={name} flex='1' gap='4' alignItems='center' justifyContent='center' flexWrap='wrap' sx={descriptionCardStyle}>

                            <Text>{name}</Text>

                        </Flex>
                    </Tooltip>
                )}
        </>

    );
};
