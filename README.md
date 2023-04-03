### Usefull links

https://docs-babylon.radixdlt.com/main/frontend/radix-dapp-toolkit.html

https://github.com/radixdlt/scrypto-examples/tree/main/full-stack/dapp-toolkit-gumball-machine

https://rcnet-dashboard.radixdlt.com/

https://docs-babylon.radixdlt.com/main/getting-started-developers/wallet-and-connector.html

https://docs-babylon.radixdlt.com/main/getting-started-developers/dapp-frontend/building-a-pure-frontend.html

https://github.com/radixdlt/wallet-sdk#get-wallet-data

https://github.com/radixdlt/connect-button

https://radix-rcnet-v1-core.redoc.ly/


### General idea

* Trader creates a trading vault

* User deposits USD into the vault

* Trader executes trades

* Profits from a trade are destributed to the users/trader

### What is the traders cut?

The traders cut is variable and is set when the vault is created.

### Which assets can be traded?

Only whitelisted assets can be tradet where enough liquidity is given

### Where are the profits saved?

Users/traders can claim profits from profit vaults -> more gas efficient then sending directly out

### How to make a fair distribution of profits when users enter leave while a trade is going on?

Users can only withdraw their funds partially while a trade is going on.
New users are not considered while a trade is going on so we have to track which users where in the vault when a trade started.
Users need to be mapped to a specific trade so we know to whom the earnings will be distributed

### Connect your Twitter account to your wallet

Should be possible somehow. Moralis offers solutions for other chains.
Twitter account can be stored in an NFT in the wallet if the user is able to verify that it is
his account.

### Connect your Twitch and other social media accounts

Make it easier to engage with the community

### Social network idea

A trader can create a discord channel and member of his fund can join based on the LP they have.
People feel like a community and can transform into a DAO.

### Mint special NFTs for users in a fund

Help traders to launch NFT collections for their fund members. Give perks to NFT holders.
More strength in the community.

### Automate trading strategies

Allow trader to run automatic trading strategies with his own algorithms
