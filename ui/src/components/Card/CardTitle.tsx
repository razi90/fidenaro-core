import { Card, Heading, SkeletonText, useColorModeValue } from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface CardTitleProps {
    cardTitle: string | any | undefined;
    isLoading: boolean;
}

export const CardTitle: React.FC<CardTitleProps> = ({ cardTitle, isLoading }) => {

    const bgColor = useColorModeValue("white", "#161616");

    return (
        <>
            {isLoading ? (
                // Render loading state here
                // ...
                <Card bg={bgColor} position="absolute" top="-10px" left="5" transform="translateX(-0%)" px="2" py={1} minW={"100px"}>
                    <Heading fontSize="xl"><SkeletonText mt='2' noOfLines={1} spacing='4' skeletonHeight='3' /></Heading>
                </Card>
            ) : cardTitle !== "" ? (
                <Card bg={bgColor} position="absolute" top="-10px" left="5" transform="translateX(-0%)" px="2" py={1}>
                    <Heading fontSize="xl">{cardTitle}</Heading>
                </Card>
            ) : null}
        </>
    );
};
