import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Profile from './containers/Profile/Profile';
import Explore from './containers/Explore/Explore';
import Portfolio from './containers/Portfolio/Portfolio';
import WallOfFame from './containers/WallOfFame/WallOfFame';
import Vault from './containers/Vault/Vault';
import UnknownPage from './containers/UnknownPage/UnknownPage';
import LeftNavigationBar from './components/LeftNavigationBar/LeftNavigationBar';
import TopNavigationBar from './components/TopNavigationBar/TopNavigationBar';
import PriceTicker from './components/PriceTicker/PriceTicker';
import { Flex, Box } from "@chakra-ui/react";
import { initRadixDappToolkit } from './libs/radix-dapp-toolkit/rdt';
import { useQueryClient } from '@tanstack/react-query';
import { fetchLeftNavigationStatus } from './libs/navigation/LeftNavigationBarDataService';
import { useBreakpointValue } from '@chakra-ui/react';

export enum LayoutMode {
    Mobile,
    DesktopMinimized,
    DesktopExpanded,
}

const Layout: React.FC = () => {
    const [isMinimized, setIsMinimized] = useState(fetchLeftNavigationStatus());

    const layoutMode = useBreakpointValue({
        base: LayoutMode.Mobile,
        md: isMinimized ? LayoutMode.DesktopMinimized : LayoutMode.DesktopExpanded,
    }) ?? LayoutMode.DesktopExpanded;

    const queryClient = useQueryClient();
    useEffect(() => {
        initRadixDappToolkit(queryClient);
    }, [queryClient]);

    const routes = [
        { path: "/", element: <Explore layoutMode={layoutMode} /> },
        { path: "/portfolio", element: <Portfolio layoutMode={layoutMode} /> },
        { path: "/walloffame", element: <WallOfFame layoutMode={layoutMode} /> },
        { path: "/profile/:id", element: <Profile layoutMode={layoutMode} /> },
        { path: "/vault/:id", element: <Vault layoutMode={layoutMode} /> },
        { path: "*", element: <UnknownPage layoutMode={layoutMode} /> },
    ];

    return (
        <BrowserRouter>
            <Box display="block">
                <TopNavigationBar />
                <Flex>
                    {layoutMode !== LayoutMode.Mobile && (
                        <LeftNavigationBar
                            isMinimized={isMinimized}
                            setIsMinimized={setIsMinimized}
                        />
                    )}
                    <Box flex="1">
                        <Routes>
                            {routes.map((route, index) => (
                                <Route key={index} path={route.path} element={route.element} />
                            ))}
                        </Routes>
                    </Box>
                </Flex>
            </Box>
            <PriceTicker layoutMode={layoutMode} />
        </BrowserRouter>
    );
}

export default Layout;
