import { Card, Icon, useColorModeValue } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { CardTitle } from './CardTitle';
import { FaMedal } from "react-icons/fa";

interface CarouselCardProps {
    children: ReactNode;
    index: any;
    cardHeight: string;
    cardWidth: string;
    isLoading: boolean;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({ children, index, cardWidth, cardHeight, isLoading }) => {

    const bgColor = useColorModeValue("white", "#161616");

    return (
        <>
            {index == 0 ? (

                <Card bg={bgColor} mt={4} mx={2} p="4" w={cardWidth} h={cardHeight} boxShadow={"0 0 5px 0px #ffd700"}>
                    <CardTitle
                        cardTitle=

                        {index == 0 ?
                            (<Icon as={FaMedal} color={"#ffd700"} w={{ base: 6, sm: 6 }} h={{ base: 6, sm: 6 }} />) :
                            (index == 1 ? (<Icon as={FaMedal} color={"#c0c0c0"} w={{ base: 6, sm: 6 }} h={{ base: 6, sm: 6 }} />) :
                                (index == 2 ? (<Icon as={FaMedal} color={"#cd7f32"} w={{ base: 6, sm: 6 }} h={{ base: 6, sm: 6 }} />) :
                                    (null)))}
                        isLoading={isLoading}
                    />
                    {children}
                </Card>

            ) : (index == 1 ? (
                <Card bg={bgColor} mt={4} mx={2} p="4" w={cardWidth} h={cardHeight} boxShadow={"0 0 5px 0px #c0c0c0"}>
                    <CardTitle
                        cardTitle={<Icon as={FaMedal} color={"#c0c0c0"} w={{ base: 6, sm: 6 }} h={{ base: 6, sm: 6 }} />}
                        isLoading={isLoading}
                    />
                    {children}
                </Card>
            ) : (index == 2 ? (
                <Card bg={bgColor} mt={4} mx={2} p="4" w={cardWidth} h={cardHeight} boxShadow={"0 0 5px 0px #cd7f32"}>
                    <CardTitle
                        cardTitle={<Icon as={FaMedal} color={"#cd7f32"} w={{ base: 6, sm: 6 }} h={{ base: 6, sm: 6 }} />}
                        isLoading={isLoading}
                    />
                    {children}
                </Card>
            ) :
                (null)))}
        </>
    );
};
