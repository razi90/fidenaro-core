import React from 'react';
import {
    Box,
    Center,
    Divider,
    Spacer,
    VStack,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import { FidenaroCircularProgress } from '../../components/Loading/FidenaroCircularProgress/FidenaroCircularProgress';
import { useQuery } from '@tanstack/react-query';
import { fetchVaultList } from '../../libs/vault/VaultDataService';
import VaultTable from '../../components/VaultTable/VaultTable';
import { AppUser } from '../../libs/entities/User';
import { fetchUserInfo } from '../../libs/user/UserDataService';

interface PortfolioProps {
    isMinimized: boolean;
}

const Portfolio: React.FC<PortfolioProps> = ({ isMinimized }) => {

    const { data: vaults, isLoading, isError } = useQuery({ queryKey: ['vault_list'], queryFn: fetchVaultList });
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<AppUser>({ queryKey: ['user_info'], queryFn: fetchUserInfo });


    if (isLoading || isUserFetchLoading) {
        return (
            <Box sx={routePageBoxStyle(isMinimized)}>
                <Center>
                    <FidenaroCircularProgress circleSize="30vh" circleBorderThickness="2px" circleImageSize="20vh" />
                </Center>
            </Box>
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
        <Box sx={routePageBoxStyle(isMinimized)} >
            <VStack spacing={12}>
                <VaultTable bigHeader='My Vaults' smallHeader='' tableData={my_vaults} />
                <VaultTable bigHeader='Following Vaults' smallHeader='' tableData={following_faults} />
            </VStack>
        </Box >
    )
}
export default Portfolio;
