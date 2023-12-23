// WinnerCard.tsx
import { Text, Image, Card, CardBody, Heading, VStack, Link } from "@chakra-ui/react";
import { Vault } from "../../../libs/entities/Vault";
import PnlText from "../../Text/PnlText";

interface WinnerCardProps {
    winner: Vault
    placementLogo: string
}

const WinnerCard: React.FC<WinnerCardProps> = ({ winner, placementLogo }) => {
    return (
        <Card maxW='sm' variant='unstyled'>
            <CardBody>
                <VStack mt='6' spacing='3'>
                    <Image
                        borderRadius='full'
                        src={winner.avatar}
                        boxSize='100px'
                    />
                    <Link href={`/vault/${winner.id}`}>
                        <Heading size='md'>{winner.vault}</Heading>
                    </Link>
                    <Image
                        src={placementLogo}
                        boxSize='50px'
                    />
                    <Text>
                        Total PnL
                    </Text>
                    <PnlText value={winner.pnl} />
                </VStack>
            </CardBody>
        </Card >
    );
};

export default WinnerCard;
