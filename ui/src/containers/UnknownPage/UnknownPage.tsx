import React from 'react';
import {
    Box,
    Center,
    Flex,
    Text,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import { FidenaroCircularProgress } from '../../components/Loading/FidenaroCircularProgress/FidenaroCircularProgress';
import { LayoutMode } from '../../Layout';

interface UnknownPageProps {
    layoutMode: LayoutMode;
}

const UnknownPage: React.FC<UnknownPageProps> = ({ layoutMode }) => {

    return (
        <Box sx={routePageBoxStyle(layoutMode)}>
            <Flex
                w="100%"
                h="80vh"
                alignItems="center"
                justifyContent="center"
            >
                <Center>
                    <Text fontSize={"40px"}>
                        Oops, I can't find the current path. <br />
                        Please check the path.
                    </Text>
                    <FidenaroCircularProgress circleSize="30vh" circleBorderThickness="2px" circleImageSize="20vh" />
                </Center>
            </Flex>
        </Box>
    );
}

export default UnknownPage;
