import React from 'react';
import {
    Box, Center, VStack,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import { useQuery } from '@tanstack/react-query';
import { fetchVaultList } from '../../libs/vault/VaultDataService';
import { CardCarousel } from '../../components/Carousel/CardCarousel';
import { PrimerCard } from '../../components/Card/PrimerCard';
import { VaultRankingTable } from '../../components/Table/VaultRankingTable';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { fetchConnectedWallet } from '../../libs/wallet/WalletDataService';
import { LayoutMode } from '../../Layout';
import { fetchUserInfo } from '../../libs/user/UserDataService';
import { User } from '../../libs/entities/User';

interface WallOfFameProps {
    layoutMode: LayoutMode;
}

const WallOfFame: React.FC<WallOfFameProps> = ({ layoutMode }) => {
    const { data: vaults, isLoading, isError } = useQuery({ queryKey: ['vault_list'], queryFn: fetchVaultList });
    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });

    if (isLoading || isUserFetchLoading) {
        return (
            <Box sx={routePageBoxStyle(layoutMode)}>
                <Center>
                    <Box maxW="6xl" minH="xl" width="100vw">
                        <VStack spacing={4}>
                            <PrimerCard cardTitle={"Wall of Fame"} cardWidth="100%" cardHeight="100%" isLoading={isLoading}>
                                <CardCarousel rankedVaults={undefined} userId={"No id"} isConnected={wallet?.persona !== undefined} />
                            </PrimerCard>
                            <Box w="100%">
                                <VaultRankingTable title="Ranking" data={undefined} userId={"No id"} isLoading={isLoading} />
                            </Box>
                        </VStack>
                    </Box>
                </Center>
            </Box>
        );
    }

    if (isError) {
        return <Box sx={routePageBoxStyle(layoutMode)}>Error loading data</Box>;
    }

    const rankedVaults = vaults!.sort((a, b) => b.calculatePnL() - a.calculatePnL());

    return (
        <Box sx={routePageBoxStyle(layoutMode)}>
            <Center>
                <Box maxW="6xl" minH="xl" width="100vw">
                    <VStack spacing={4}>
                        <PrimerCard cardTitle={"Wall of Fame"} cardWidth="100%" cardHeight="100%" isLoading={isLoading}>
                            <CardCarousel rankedVaults={rankedVaults} userId={user!.id} isConnected={wallet?.persona !== undefined} />
                        </PrimerCard>
                        <Box w="100%">
                            <VaultRankingTable title="Ranking" data={rankedVaults} userId={user!.id} isLoading={isLoading} />
                        </Box>
                    </VStack>
                </Box>
            </Center>
        </Box>
    );
}

export default WallOfFame;
