import { Card } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { CardTitle } from './CardTitle';

interface PrimerCardProps {
    children: ReactNode
    cardTitle: string | undefined;
    cardHeight: string;
    cardWidth: string;
    isLoading: boolean;
}

export const PrimerCard: React.FC<PrimerCardProps> = ({ children, cardTitle, cardWidth, cardHeight, isLoading }) => {

    return (
        <Card m={1} p="6" w={cardWidth} h={cardHeight}>
            <CardTitle cardTitle={cardTitle} isLoading={isLoading} />
            {children}
        </Card>
    );
};
