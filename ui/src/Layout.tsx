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
} from "@chakra-ui/react";
import { initRadixDappToolkit } from './libs/radix-dapp-toolkit/rdt';
import { useQueryClient } from '@tanstack/react-query';



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
        <BrowserRouter>
            <TopNavigationBar />
            <Flex>
                <LeftNavigationBar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
                <Routes>
                    <Route path="/" element={<Explore isMinimized={isMinimized} />} />
                    <Route path="/portfolio" element={<Portfolio isMinimized={isMinimized} />} />
                    <Route path="/walloffame" element={<WallOfFame isMinimized={isMinimized} />} />
                    <Route path="/profile" element={<Profile isMinimized={isMinimized} />} />
                    <Route path="/vault/:id" element={<Vault isMinimized={isMinimized} />} />
                    <Route
                        path="*"
                        element={<UnknownPage isMinimized={isMinimized} />}
                    />
                </Routes>
            </Flex>
        </BrowserRouter >
    )
}
export default Layout;
