import React from 'react';
import {
    Box,
    Center,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';

interface WallOfFameProps {
    isMinimized: boolean;
}

const WallOfFame: React.FC<WallOfFameProps> = ({ isMinimized }) => {

    return (

        <Box sx={routePageBoxStyle(isMinimized)}>
            <Center>
                Wall of Fame 1.2.3
            </Center>
        </Box >
    )
}
export default WallOfFame;
