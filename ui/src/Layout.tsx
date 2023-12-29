// general
import React, { useEffect } from 'react';
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Profile from './containers/Profile/Profile';
import Explore from './containers/Explore/Explore';
import Portfolio from './containers/Portfolio/Portfolio';
import WallOfFame from './containers/WallOfFame/WallOfFame';
import Vault from './containers/Vault/Vault';
import UnknownPage from './containers/UnknownPage/UnknownPage';
import LeftNavigationBar from './components/LeftNavigationBar/LeftNavigationBar';
import TopNavigationBar from './components/TopNavigationBar/TopNavigationBar';
import {
    Text,
    Flex,
    Box,
    Center,
} from "@chakra-ui/react";
import { initRadixDappToolkit } from './libs/radix-dapp-toolkit/rdt';
import { useQueryClient } from '@tanstack/react-query';
import { routePageBoxStyle } from './libs/styles/RoutePageBox';
import { FidenaroCircularProgress } from './components/Loading/FidenaroCircularProgress/FidenaroCircularProgress';



const Layout: React.FC = () => {
    // state for the left navigation bar width
    const [isMinimized, setIsMinimized] = useState(() => {
        const storedValue = localStorage.getItem("leftNavigationBarIsMinimized");
        return storedValue ? JSON.parse(storedValue) : false;
    });

    // init subscription for wallet connection recognizer.
    const queryClient = useQueryClient()
    useEffect(() => {
        initRadixDappToolkit(queryClient);
    }, []);



    return (
        <BrowserRouter >
            { /* Desktop version of the fidenaro app */}
            <Box display={{ base: "none", sm: "none", md: "none", lg: "block" }}>
                <TopNavigationBar />
                <Flex >
                    <LeftNavigationBar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
                    <Routes>
                        <Route path="/" element={<Explore isMinimized={isMinimized} />} />
                        <Route path="/portfolio" element={<Portfolio isMinimized={isMinimized} />} />
                        <Route path="/walloffame" element={<WallOfFame isMinimized={isMinimized} />} />
                        <Route path="/profile/:id" element={<Profile isMinimized={isMinimized} />} />
                        <Route path="/vault/:id" element={<Vault isMinimized={isMinimized} />} />
                        <Route
                            path="*"
                            element={<UnknownPage isMinimized={isMinimized} />}
                        />
                    </Routes>
                </Flex>
            </Box>
            { /* Placeholder for the mobile version */}
            <Box display={{ base: "block", sm: "block", md: "block", lg: "none" }}>
                <Box
                    bg={"back.900"}
                    w="100%"
                    h={"100vh"}
                    alignItems="center"
                    justifyContent="center"
                >
                    <Center>

                        <FidenaroCircularProgress circleSize="30vh" circleBorderThickness="2px" circleImageSize="20vh" />

                    </Center>
                    <Text w="100%"
                        align={"center"}
                        alignItems="center"
                        justifyContent="center" color={"grey"} fontSize={"14px"}>
                        There is currently no support for a Mobile Version of Fidenaro. <br />
                        Please choose a Desktop environment in order to Test the Beta.
                    </Text>
                </Box >
            </Box>
        </BrowserRouter >
    )
}
export default Layout;
