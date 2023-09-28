// general
import React from 'react';
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Profile from './containers/Profile/Explore';
import Explore from './containers/Explore/Explore';
import Portfolio from './containers/Portfolio/Portfolio';
import WallOfFame from './containers/WallOfFame/WallOfFame';
import UnknownPage from './containers/UnknownPage/UnknownPage';
import LeftNavigationBar from './components/LeftNavigationBar/LeftNavigationBar';
import TopNavigationBar from './components/TopNavigationBar/TopNavigationBar';
import {
    Flex,
} from "@chakra-ui/react";



const Layout: React.FC = () => {
    // state for the left navigation bar width
    const [isMinimized, setIsMinimized] = useState(() => {
        const storedValue = localStorage.getItem("leftNavigationBarIsMinimized");
        return storedValue ? JSON.parse(storedValue) : false;
    });
    //useState(false);

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
