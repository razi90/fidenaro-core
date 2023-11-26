import { Card } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { CardTitle } from './CardTitle';

interface PrimerCardProps {
    children: ReactNode
    cardTitle: string;
    cardHeight: string;
    cardWidth: string;
}

export const PrimerCard: React.FC<PrimerCardProps> = ({ children, cardTitle, cardWidth, cardHeight }) => {

    return (
        <Card m={1} p="6" w={cardWidth} h={cardHeight}>
            <CardTitle cardTitle={cardTitle} />
            {children}
        </Card>
    );
};
