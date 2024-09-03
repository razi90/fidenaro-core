import React from 'react';
import {
    Box,
    Center,
    Text,
    VStack,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import { useQuery } from '@tanstack/react-query';
import { fetchVaultList } from '../../libs/vault/VaultDataService';
import VaultTable from '../../components/Table/VaultTable/VaultTable';
import { User } from '../../libs/entities/User';
import { fetchUserInfo } from '../../libs/user/UserDataService';
import { PrimerCard } from '../../components/Card/PrimerCard';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { fetchConnectedWallet } from '../../libs/wallet/WalletDataService';
import { LayoutMode } from '../../Layout';

interface PortfolioProps {
    layoutMode: LayoutMode;
}

const Portfolio: React.FC<PortfolioProps> = ({ layoutMode }) => {

    const { data: vaults, isLoading, isError } = useQuery({ queryKey: ['vault_list'], queryFn: fetchVaultList });
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });
    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    if (wallet?.persona == undefined) {
        return (
            <Box sx={routePageBoxStyle(layoutMode)}>
                <Center>
                    <Box maxW="6xl" minH="xl" width="100vw">
                        <PrimerCard cardTitle={"Wallet not connected!"} cardWidth='100%' cardHeight='100%' isLoading={false}>
                            <Text>Please connect your Radix DLT Wallet in order to connect/create a Fidenaro Profile.</Text>
                        </PrimerCard>
                    </Box>
                </Center>
            </Box>
        );
    }

    if (isLoading || isUserFetchLoading || isWalletFetchLoading) {
        return (
            <Box sx={routePageBoxStyle(layoutMode)} p={'8'}>
                <Center>
                    <Box maxW="6xl" minH="xl" width="100vw">
                        <VStack spacing={4}>
                            <PrimerCard cardTitle={"My Vaults"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                                <VaultTable tableData={undefined} isLoading={isLoading} user={user} isConnected={wallet?.persona == undefined ? false : true} />
                            </PrimerCard>
                            <PrimerCard cardTitle={"Following Vaults"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                                <VaultTable tableData={undefined} isLoading={isLoading} user={user} isConnected={wallet?.persona == undefined ? false : true} />
                            </PrimerCard>
                        </VStack>
                    </Box>
                </Center>
            </Box>
        );
    }

    if (isError || isUserFetchError) {
        return <Box sx={routePageBoxStyle(layoutMode)}>Error loading data</Box>;
    }

    const my_vaults = vaults.filter((vault) => vault.manager.id === user?.id);
    const following_vaults = vaults.filter((vault) =>
        vault.followers.includes(user!.id)
    );

    return (
        <Box sx={routePageBoxStyle(layoutMode)} p={'8'}>
            <Center>
                <Box maxW="6xl" minH="xl" width="100vw">
                    <VStack spacing={4}>
                        <PrimerCard cardTitle={"My Vaults"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                            <VaultTable tableData={my_vaults} isLoading={isLoading} user={user} isConnected={wallet?.persona == undefined ? false : true} />
                        </PrimerCard>
                        <PrimerCard cardTitle={"Following Vaults"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                            <VaultTable tableData={following_vaults} isLoading={isLoading} user={user} isConnected={wallet?.persona == undefined ? false : true} />
                        </PrimerCard>
                    </VStack>
                </Box>
            </Center>
        </Box>
    );
}

export default Portfolio;
