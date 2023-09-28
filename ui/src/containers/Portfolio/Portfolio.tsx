import React from 'react';
import {
    Box,
    Center,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';

interface PortfolioProps {
    isMinimized: boolean;
}

const Portfolio: React.FC<PortfolioProps> = ({ isMinimized }) => {

    return (
        <Box sx={routePageBoxStyle(isMinimized)} >
            <Center>
                Portfolio
            </Center>
        </Box >
    )
}
export default Portfolio;
