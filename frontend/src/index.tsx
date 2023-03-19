import * as React from "react"
import * as ReactDOM from "react-dom/client"
import * as serviceWorker from "./serviceWorker"
import reportWebVitals from "./reportWebVitals"
import { ColorModeScript } from "@chakra-ui/react"
import { App } from "./App"


// set global variables
globalThis.packageAddress = "package_tdx_b_1qxmzvdug22x5wza6u225y9vetq45ggjxmha8selv6d6qqzmkar"
globalThis.dAppId = "account_tdx_b_1pqhy68vjzkdkujlajld6yhspztzkh5vtxu9mvm6rw9sqdq6tcd"
globalThis.dAppName = "Fidenaro"

const container = document.getElementById("root")
if (!container) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(container)

root.render(
  <React.StrictMode>
    <ColorModeScript />
    <App />
  </React.StrictMode>,
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.register()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

