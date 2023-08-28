import React from 'react';
import {
    Box,
    Center,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';

const Portfolio: React.FC = () => {

    return (
        <Box sx={routePageBoxStyle} >
            <Center>
                Portfolio
            </Center>
        </Box >
    )
}
export default Portfolio;
