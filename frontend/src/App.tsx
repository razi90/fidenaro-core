import {
  ChakraProvider,
  Box,
  theme,
  Flex
} from "@chakra-ui/react"
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";
import NavBarTop from './navigation/nav_bar_top'
import NavBarBottom from './navigation/nav_bar_bottom'
import Sidebar from "./navigation/sidebar";
import Home from './routes/home'
import Explore from "./routes/explore";
import Dashboard from "./routes/dashboard";
import Docs from "./routes/docs";
import Create from "./routes/create_vault/create-vault-ui";
import Trade from "./routes/trade";
import Vault from "./routes/VaultView";
import { dAppName, dAppId } from "./etc/globals.d";
import Leaderboard from "./routes/leaderboard";


const rdt = RadixDappToolkit(
  { dAppDefinitionAddress: dAppId, dAppName: dAppName },
  (requestData) => {
    requestData({
      accounts: { quantifier: 'atLeast', quantity: 1 },
    }).map(({ data: { accounts } }) => {
      // add accounts to dApp application state
      console.log("account data: ", accounts)
      localStorage.setItem('account', accounts[0].address);
    })
  },
  {
    networkId: 12, // 12 is for RCnet 01 for Mainnet
    onDisconnect: () => {
      // clear your application state
    },
    onInit: ({ accounts }) => {
      // set your initial application state
      console.log("onInit accounts: ", accounts)
      if (accounts && accounts.length > 0) {
        localStorage.setItem('account', accounts[0].address);
      }
    },
  }
)


declare global {
  interface Window {
    rdt: typeof rdt
  }
}

window.rdt = rdt

console.log("dApp Toolkit: ", window.rdt)

export const App = () => (

  <ChakraProvider theme={theme}>
    <BrowserRouter>
      <NavBarTop />
      <Flex>
        <Sidebar />
        <Box flex="1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fidenaro" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/create" element={<Create />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/vault/:id" element={<Vault />} />
            <Route
              path="*"
              element={
                <main style={{ padding: "1rem" }}>
                  <p>There's nothing here! </p>
                </main>
              }
            />
          </Routes>
        </Box>
      </Flex>
      <Box p={4}>Copyright 2023 {dAppName} | Trade smarter</Box>
      <NavBarBottom />
    </BrowserRouter>
  </ChakraProvider>
)
