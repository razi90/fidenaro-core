import React from 'react';
import {
    Box,
    Center,
    Flex,
    Text,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import { FidenaroCircularProgress } from '../../components/Loading/FidenaroCircularProgress/FidenaroCircularProgress';

interface UnknownPageProps {
    isMinimized: boolean;
}

const UnknownPage: React.FC<UnknownPageProps> = ({ isMinimized }) => {

    return (
        <Box sx={routePageBoxStyle(isMinimized)} >
            <Flex
                w="100%"
                h="80vh"
                alignItems="center"
                justifyContent="center"
            >
                <Center>
                    <Text fontSize={"40px"}>
                        Upsi, I can't find the current path. <br />
                        Please check the path.
                    </Text>
                    <FidenaroCircularProgress circleSize="30vh" circleBorderThickness="2px" circleImageSize="20vh" />
                </Center>
            </Flex>

        </Box >
    )
}
export default UnknownPage;
