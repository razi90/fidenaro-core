import React from 'react';
import {
    Box, Center,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import Podium from '../../components/Podium/Podium';
import { useQuery } from '@tanstack/react-query';
import { fetchVaultList } from '../../libs/vault/VaultDataService';
import { FidenaroCircularProgress } from '../../components/Loading/FidenaroCircularProgress/FidenaroCircularProgress';

interface WallOfFameProps {
    isMinimized: boolean;
}

const WallOfFame: React.FC<WallOfFameProps> = ({ isMinimized }) => {
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

    const rankedVaults = vaults!.sort((a, b) => b.pnl - a.pnl);

    return (
        <Box sx={routePageBoxStyle(isMinimized)}>
            <Podium rankedVaults={rankedVaults} />
        </Box >
    )
}
export default WallOfFame;
