// Podium.tsx
import { Box, Center, HStack, Heading, Table, TableContainer, Tbody, Td, Th, Thead, Tr, VStack, Text, Link } from "@chakra-ui/react";
import WinnerCard from "../Card/WinnerCard/WinnerCard";
import { Vault } from "../../libs/entities/Vault";
import PnlText from "../Text/PnlText";

interface PodiumProps {
    rankedVaults: Vault[];
}

const firstPlaceLogo: string = "/images/PodiumFirstRank.png"
const secondPlaceLogo: string = "/images/PodiumSecondRank.png"
const thirdPlaceLogo: string = "/images/PodiumThirdRank.png"

const Podium: React.FC<PodiumProps> = ({ rankedVaults }) => {
    return (
        <Center>
            <VStack>
                <Heading mt="10">Wall of Fame</Heading>
                <HStack direction="column" align="center" spacing={16}>
                    <Box mt="100">
                        <WinnerCard winner={rankedVaults[1]} placementLogo={secondPlaceLogo} />
                    </Box>
                    <Box>
                        <WinnerCard winner={rankedVaults[0]} placementLogo={firstPlaceLogo} />
                    </Box>
                    <Box mt="150">
                        <WinnerCard winner={rankedVaults[2]} placementLogo={thirdPlaceLogo} />
                    </Box>
                </HStack >

                <TableContainer>
                    <Table variant='simple'>
                        <Thead>
                            <Tr>
                                <Th textTransform="none">
                                    <Text>Rank</Text>
                                </Th>
                                <Th textTransform="none">
                                    <Text>Name</Text>
                                </Th>
                                <Th textTransform="none">
                                    <Text>Total PnL</Text>
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rankedVaults.slice(3).map((vault, index) => (
                                <Tr key={index}>
                                    <Td>
                                        <Text>{index + 4}</Text>
                                    </Td>
                                    <Td>
                                        <Link href={`/vault/${vault.id}`}>{vault.vault}</Link>
                                    </Td>
                                    <Td>
                                        <PnlText value={vault.pnl}></PnlText>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </VStack>
        </Center>
    );
};

export default Podium;