import React from 'react';
import {
    Box,
    Center,
    Spacer,
    VStack,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import { FidenaroCircularProgress } from '../../components/Loading/FidenaroCircularProgress/FidenaroCircularProgress';
import { useQuery } from '@tanstack/react-query';
import { fetchVaultList } from '../../libs/vault/VaultDataService';
import VaultTable from '../../components/Table/VaultTable/VaultTable';
import { AppUser } from '../../libs/entities/User';
import { fetchUserInfo } from '../../libs/user/UserDataService';
import { PrimerCard } from '../../components/Card/PrimerCard';

interface PortfolioProps {
    isMinimized: boolean;
}

const Portfolio: React.FC<PortfolioProps> = ({ isMinimized }) => {

    const { data: vaults, isLoading, isError } = useQuery({ queryKey: ['vault_list'], queryFn: fetchVaultList });
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<AppUser>({ queryKey: ['user_info'], queryFn: fetchUserInfo });


    if (isLoading || isUserFetchLoading) {
        return (
            <Box sx={routePageBoxStyle(isMinimized)} p={'8'}>
                <Center>
                    <Box maxW="6xl" minH="xl" width="100vw" >
                        <VStack spacing={4}>
                            <PrimerCard cardTitle={"My Vaults"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                                <VaultTable smallHeader='' tableData={undefined} isLoading={isLoading} user={user} />
                            </PrimerCard>
                            <PrimerCard cardTitle={"Following Vaults"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                                <VaultTable smallHeader='' tableData={undefined} isLoading={isLoading} user={user} />
                            </PrimerCard>
                        </VStack>
                    </Box >
                </Center >
            </Box >
        );
    }

    if (isError || isUserFetchError) {
        // Return error JSX if an error occurs during fetching
        return <Box sx={routePageBoxStyle(isMinimized)}>Error loading data</Box>;
    }

    const my_vaults = vaults.filter((vault) => vault.manager === user?.account);
    const following_faults = vaults.filter((vault) =>
        vault.followerList.includes(user!.account)
    );


    return (
        <Box sx={routePageBoxStyle(isMinimized)} p={'8'}>
            <Center>
                <Box maxW="6xl" minH="xl" width="100vw" >
                    <VStack spacing={4}>
                        <PrimerCard cardTitle={"My Vaults"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                            <VaultTable smallHeader='' tableData={my_vaults} isLoading={isLoading} user={user} />
                        </PrimerCard>
                        <PrimerCard cardTitle={"Following Vaults"} cardWidth='100%' cardHeight='100%' isLoading={isLoading}>
                            <VaultTable smallHeader='' tableData={following_faults} isLoading={isLoading} user={user} />
                        </PrimerCard>
                    </VStack>
                </Box >
            </Center >
        </Box >
    )
}
export default Portfolio;
