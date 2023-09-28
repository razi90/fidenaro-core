import React from 'react';
import {
    Box,
    Center,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';

interface ProfileProps {
    isMinimized: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isMinimized }) => {

    return (

        <Box sx={routePageBoxStyle(isMinimized)}>
            <Center>
                Coolio is on stage.
            </Center>
        </Box >
    )
}
export default Profile;
