import { Card, Heading } from '@chakra-ui/react';

interface CardTitleProps {
    cardTitle: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ cardTitle }) => {

    return (
        <>
            {cardTitle != "" ?
                <Card position="absolute" top="-10px" left="5" transform="translateX(-0%)" px="2" py={1}>
                    <Heading fontSize='xl'>{cardTitle}</Heading>
                </Card>
                : null}
        </>
    );
};
