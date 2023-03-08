import {
  ChakraProvider,
  Box,
  theme,
} from "@chakra-ui/react"
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBarTop from './navigation/nav_bar_top'
import NavBarBottom from './navigation/nav_bar_bottom'
import Home from './routes/home'

export const App = () => (
  <ChakraProvider theme={theme}>
    <BrowserRouter>
      <NavBarTop />
      <Routes>
        const Links = ['Own', 'Explore', 'Collections', 'Mint', 'Rewards'];

        <Route path="/" element={<Home />} />
        <Route
          path="*"
          element={
            <main style={{ padding: "1rem" }}>
              <p>There's nothing here!</p>
            </main>
          }
        />
      </Routes>
      <Box p={4}>Copyright 2023 Fidenaro | Trade smarter</Box>
      <NavBarBottom />
    </BrowserRouter>
  </ChakraProvider>
)
