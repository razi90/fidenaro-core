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


interface ExploreProps {
    isMinimized: boolean;
}

const Explore: React.FC<ExploreProps> = ({ isMinimized }) => {
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });
    const { data: vaults, isLoading, isError } = useQuery<Vault[]>({ queryKey: ['vault_list'], queryFn: fetchVaultList });
    // Get data to check if wallet is connected
    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    if (isLoading || isUserFetchLoading) {
        return (
            <Box sx={routePageBoxStyle(isMinimized)} p={'8'}>
                <Center>
                    <Box maxW="6xl" minH="xl" width="100vw" >
                        <PrimerCard cardTitle={"Explore"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                            <VaultTable smallHeader='Become part of the community' tableData={undefined} isLoading={isLoading} user={user} isConnected={user?.persona == undefined ? false : true} />
                        </PrimerCard>
                    </Box >
                </Center>
            </Box>
        );
    }

    if (isError) {
        // Return error JSX if an error occurs during fetching
        return <Box sx={routePageBoxStyle(isMinimized)}>Error loading data</Box>;
    }

    // Data is ready, render the VaultTable component with the fetched data
    return (
        <>
            <Box sx={routePageBoxStyle(isMinimized)} p={'8'}>
                <Center>
                    <Box maxW="6xl" minH="xl" width="100vw" >
                        <PrimerCard cardTitle={"Explore"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                            <VaultTable smallHeader='Become part of the community' tableData={vaults} isLoading={isLoading} user={user} isConnected={wallet?.persona == undefined ? false : true} />
                        </PrimerCard>
                    </Box >
                </Center>
            </Box>
        </>
    );
}

export default Explore;
