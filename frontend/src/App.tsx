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


// set global variables
globalThis.packageAddress = "package_tdx_b_1qxmzvdug22x5wza6u225y9vetq45ggjxmha8selv6d6qqzmkar"
globalThis.dAppId = "account_tdx_b_1pqhy68vjzkdkujlajld6yhspztzkh5vtxu9mvm6rw9sqdq6tcd"
globalThis.dAppName = "Fidenaro"

const rdt = RadixDappToolkit(
  { dAppDefinitionAddress: globalThis.dAppId, dAppName: globalThis.dAppName },
  (requestData) => {
    requestData({
      accounts: { quantifier: 'atLeast', quantity: 1 },
    }).map(({ data: { accounts } }) => {
      // add accounts to dApp application state
      console.log("account data: ", accounts)
      localStorage.setItem('account', accounts[0].address);
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
              <p>There's nothing here! </p>
            </main>
          }
        />
      </Routes>
      <Box p={4}>Copyright 2023 {globalThis.dAppName} | Trade smarter</Box>
      <NavBarBottom />
    </BrowserRouter>
  </ChakraProvider>
)
