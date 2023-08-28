// general
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Explore from './containers/Explore/Explore';
import Portfolio from './containers/Portfolio/Portfolio';
import LeftNavigationBar from './components/LeftNavigationBar/LeftNavigationBar';
import TopNavigationBar from './components/TopNavigationBar/TopNavigationBar';
import {
    Grid,
} from "@chakra-ui/react";


class Layout extends React.Component {

    render() {
        return <>
            <BrowserRouter>
                <TopNavigationBar />

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
            </BrowserRouter >
        </>
    }
}
export default Layout;
