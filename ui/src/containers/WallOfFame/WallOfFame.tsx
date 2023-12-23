import React, { useState } from 'react';
import {
    Box, Center, VStack,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import Podium from '../../components/Podium/Podium';
import { useQuery } from '@tanstack/react-query';
import { fetchVaultList } from '../../libs/vault/VaultDataService';
import { FidenaroCircularProgress } from '../../components/Loading/FidenaroCircularProgress/FidenaroCircularProgress';
import { CardCarousel } from '../../components/Carousel/CardCarousel';
import { PrimerCard } from '../../components/Card/PrimerCard';
import { VaultRankingTable } from '../../components/Table/VaultRankingTable';




interface WallOfFameProps {
    isMinimized: boolean;
}

const WallOfFame: React.FC<WallOfFameProps> = ({ isMinimized }) => {
    const { data: vaults, isLoading, isError } = useQuery({ queryKey: ['vault_list'], queryFn: fetchVaultList });


    if (isLoading) {
        return (
            <Box sx={routePageBoxStyle(isMinimized)}>
                <Center>
                    <Box maxW="6xl" minH="xl" width="100vw" >
                        <VStack spacing={4}>
                            <PrimerCard cardTitle={"Wall of Fame"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                                <CardCarousel rankedVaults={undefined} />
                            </PrimerCard>
                            <Box w={"100%"}>
                                <VaultRankingTable title='Ranking' data={undefined} isLoading={isLoading} />
                            </Box>
                        </VStack>
                    </Box >
                </Center>
            </Box >
        );
    }

    if (isError) {
        // Return error JSX if an error occurs during fetching
        return <Box sx={routePageBoxStyle(isMinimized)}>Error loading data</Box>;
    }

    const rankedVaults = vaults!.sort((a, b) => b.pnl - a.pnl);



    return (
        <Box sx={routePageBoxStyle(isMinimized)}>
            <Center>
                <Box maxW="6xl" minH="xl" width="100vw" >
                    <VStack spacing={4}>
                        <PrimerCard cardTitle={"Wall of Fame"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                            <CardCarousel rankedVaults={rankedVaults} />
                        </PrimerCard>
                        <Box w={"100%"}>
                            <VaultRankingTable title='Ranking' data={rankedVaults} isLoading={isLoading} />
                        </Box>
                    </VStack>
                </Box >
            </Center>
        </Box >
    )
}

export default WallOfFame;