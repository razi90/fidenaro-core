import React from 'react';
import {
    Box, Center,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import VaultTable from '../../components/Table/VaultTable/VaultTable';
import { useQuery } from '@tanstack/react-query';
import { fetchVaultList } from '../../libs/vault/VaultDataService';
import { PrimerCard } from '../../components/Card/PrimerCard';
import { User } from '../../libs/entities/User';
import { fetchUserInfo } from '../../libs/user/UserDataService';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { fetchConnectedWallet } from '../../libs/wallet/WalletDataService';
import { Vault } from '../../libs/entities/Vault';
import { LayoutMode } from '../../Layout';

interface ExploreProps {
    layoutMode: LayoutMode;
}

const Explore: React.FC<ExploreProps> = ({ layoutMode }) => {
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });
    const { data: vaults, isLoading, isError } = useQuery<Vault[]>({ queryKey: ['vault_list'], queryFn: fetchVaultList });
    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    if (isLoading || isUserFetchLoading) {
        return (
            <Box sx={routePageBoxStyle(layoutMode)} p={'0'}>
                <Center>
                    <Box maxW="6xl" minH="xl" width="100vw" >
                        <PrimerCard cardTitle={"Explore"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                            <VaultTable tableData={undefined} isLoading={isLoading} user={user} isConnected={wallet?.persona == undefined ? false : true} />
                        </PrimerCard>
                    </Box >
                </Center>
            </Box>
        );
    }

    if (isError) {
        return <Box sx={routePageBoxStyle(layoutMode)}>Error loading data</Box>;
    }

    return (
        <Box sx={routePageBoxStyle(layoutMode)} p={'0'}>
            <Center>
                <Box maxW="6xl" minH="xl" width="100vw" >
                    <PrimerCard cardTitle={"Explore"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                        <VaultTable tableData={vaults} isLoading={isLoading} user={user} isConnected={wallet?.persona == undefined ? false : true} />
                    </PrimerCard>
                </Box >
            </Center>
        </Box>
    );
}

export default Explore;
