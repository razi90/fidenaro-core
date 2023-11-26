import React from 'react';
import {
    Box, Center,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import VaultTable from '../../components/VaultTable/VaultTable';
import { useQuery } from '@tanstack/react-query';
import { fetchVaultList } from '../../libs/vault/VaultDataService';
import { FidenaroCircularProgress } from '../../components/Loading/FidenaroCircularProgress/FidenaroCircularProgress';

interface ExploreProps {
    isMinimized: boolean;
}

const Explore: React.FC<ExploreProps> = ({ isMinimized }) => {
    const { data: vaults, isLoading, isError } = useQuery({ queryKey: ['vault_list'], queryFn: fetchVaultList });

    if (isLoading) {
        return (
            <Box sx={routePageBoxStyle(isMinimized)}>
                <Center>
                    <FidenaroCircularProgress circleSize="30vh" circleBorderThickness="2px" circleImageSize="20vh" />
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
        <Box sx={routePageBoxStyle(isMinimized)}>
            <VaultTable bigHeader='Explore' smallHeader='Become part of the community' tableData={vaults} />
        </Box>
    );
}

export default Explore;
