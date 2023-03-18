import {
  ChakraProvider,
  Box,
  theme,
} from "@chakra-ui/react"
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";
import NavBarTop from './navigation/nav_bar_top'
import NavBarBottom from './navigation/nav_bar_bottom'
import Home from './routes/home'

const newAccount = '0x12345678901234567890';
globalThis.ACCOUNT = newAccount;

const dAppId = 'account_tdx_22_1prd6gfrqj0avlyxwldgyza09fp7gn4vjmga7clhe9p2qv0qt58'

const rdt = RadixDappToolkit(
  { dAppDefinitionAddress: dAppId, dAppName: 'GumballMachine' },
  (requestData) => {
    requestData({
      accounts: { quantifier: 'atLeast', quantity: 1 },
    }).map(({ data: { accounts } }) => {
      // add accounts to dApp application state
      console.log("account data: ", accounts)
      globalThis.ACCOUNT = accounts[0].address
    })
  },
  { networkId: 11 }
)
console.log("dApp Toolkit: ", rdt)


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
