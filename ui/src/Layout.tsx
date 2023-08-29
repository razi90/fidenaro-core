// general
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Explore from './containers/Explore/Explore';
import Portfolio from './containers/Portfolio/Portfolio';
import LeftNavigationBar from './components/LeftNavigationBar/LeftNavigationBar';
import TopNavigationBar from './components/TopNavigationBar/TopNavigationBar';
import {
    Flex,
} from "@chakra-ui/react";


class Layout extends React.Component {
    render() {
        return <>
            <BrowserRouter>
                <TopNavigationBar />
                <Flex>
                    <LeftNavigationBar />
                    <Routes>
                        <Route path="/" element={<Explore />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route
                            path="*"
                            element={
                                <main style={{ padding: "1rem" }}>
                                    <p>There's nothing here!</p>
                                </main>
                            }
                        />
                    </Routes>
                </Flex>
            </BrowserRouter >
        </>
    }
}
export default Layout;
