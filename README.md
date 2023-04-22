# Fidenaro on RCNet

Guide copied from [Gumball Machine Scrypto example](https://github.com/radixdlt/scrypto-examples/blob/main/full-stack/dapp-toolkit-gumball-machine/README.md) and modified for Fidenaro

This tutorial is meant to guide you through building, deploying and using the Fidenaro package using the [Radix dApp Toolkit](https://github.com/radixdlt/radix-dapp-toolkit#readme)

## Pre-requisites
1. Node >= 12.17.0
2. The test wallet & Radix connector-extension browser extenstion installed. Instructions [here](https://docs-babylon.radixdlt.com/main/getting-started-developers/wallet-and-connector.html)
3. Scrypto v0.9.0. Instructions to install [here](https://docs-babylon.radixdlt.com/main/getting-started-developers/first-component/install-scrypto.html) and update [here](https://docs-babylon.radixdlt.com/main/getting-started-developers/first-component/updating-scrypto.html)

## Building the Scrypto code

> **Hint:** The following steps need to be performed first for the radswap package. Just replace `fidenaro` with `radswap` in the steps below.

1. Enter the scrypto directory in a terminal: `cd scrypto`
1. Build the code: `scrypto build`
1. Two important files (`fidenaro.schema` and `fidenaro.wasm`) will be generated in `scrypto/target/wasm32-unknown-unknown/release/`. You will need them for the next step.

## Deploy the package to RCnet

> **Hint:** The following steps need to be performed first for the radswap package. Just replace `fidenaro` with `radswap` in the steps below.

1. Go to the [RCnet Dashboard Website](https://rcnet-dashboard.radixdlt.com/)
2. Connect the Wallet Via the Connect Button
3. Navigate to Deploy Package & choose an account and badge or have one created for you if you don't have one yet using the link below. (Which appears once you have selected an account)
4. Upload both `fidenaro.schema` and `fidenaro.wasm`
5. Click on "publish package"
6. The wallet should open up and ask you to approve the transaction
7. On the wallet click on "sign transaction"
8. The deployed package address should get displayed. **You will need it for the next step**.


## Interacting with Fidenaro Locally

The interaction is automated in the scrypto/run.sh script.
The steps are commented.

## Usefull links

### Radix dApp Toolkit
The Radix dApp Toolkit wraps together the Wallet SDK and Gateway SDK along with a framework agnostic √ Connect Button web component. Together they make it easy for developers to connect users and their Radix Wallet to their dApps.

https://docs-babylon.radixdlt.com/main/frontend/radix-dapp-toolkit.html

### Wallet SDK

This is a TypeScript developer SDK that facilitates communication with the Radix Wallet for two purposes: requesting various forms of data from the wallet and sending transactions to the wallet.

https://github.com/radixdlt/wallet-sdk

### Connect Button

The √ Connect Button is a framework agnostic web component to help developers connect users and their Radix Wallet to their dApps.

### Babylon Core API 

This API is exposed by the Babylon Radix node to give clients access to the Radix Engine, Mempool and State in the node.

It is intended for use by node-runners on a private network, and is not intended to be exposed publicly. Very heavy load may impact the node's function.

This API exposes queries against the node's current state (see /lts/state/ or /state/), and streams of transaction history (under /lts/stream/ or /stream).

https://radix-rcnet-v1-core.redoc.ly/

### Beaker DEX

You can swap XRD to other assets using the Beaker DEX. This assets can then be used to create a trading vault on the RCnet.

https://beaker.fi/swap?tk1=XRD&tk2=WBTC


# General idea

* Trader creates a trading vault

* User deposits USD into the vault

* Trader executes trades

* Profits from a trade are destributed to the users/trader

## What is the traders cut?

The traders cut is variable and is set when the vault is created.

## Which assets can be traded?

Only whitelisted assets can be tradet where enough liquidity is given

## Where are the profits saved?

Users/traders can claim profits from profit vaults -> more gas efficient then sending directly out

## How to make a fair distribution of profits when users enter leave while a trade is going on?

Users can only withdraw their funds partially while a trade is going on.
New users are not considered while a trade is going on so we have to track which users where in the vault when a trade started.
Users need to be mapped to a specific trade so we know to whom the earnings will be distributed

## Connect your Twitter account to your wallet

Should be possible somehow. Moralis offers solutions for other chains.
Twitter account can be stored in an NFT in the wallet if the user is able to verify that it is
his account.

## Connect your Twitch and other social media accounts

Make it easier to engage with the community

## Social network idea

A trader can create a discord channel and member of his fund can join based on the LP they have.
People feel like a community and can transform into a DAO.

## Mint special NFTs for users in a fund

Help traders to launch NFT collections for their fund members. Give perks to NFT holders.
More strength in the community.

## Automate trading strategies

Allow trader to run automatic trading strategies with his own algorithms
