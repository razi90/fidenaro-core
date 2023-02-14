# set -x

resim reset

OP=$(resim new-account)


# resim new-account (wallet)
export account=$(echo "$OP" | sed -nr "s/Account component address: ([[:alnum:]_]+)/\1/p")
export privkey=$(echo "$OP" | sed -nr "s/Private key: ([[:alnum:]_]+)/\1/p")
export pub=$(echo "$OP" | sed -nr "s/Public key: ([[:alnum:]_]+)/\1/p")

# make initially created account default
resim set-default-account $account $privkey

# create a new stable coin
OP=$(resim new-token-fixed --name USDC --symbol USDC 100000000000)
export usdc_resource_address=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '1!d')

# create bitcoin
OP=$(resim new-token-fixed --name Bitcoin --symbol BTC 21000000)
export btc_resource_address=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '1!d')

# create a simple nft badge.
# the owner badge must be presented in order to be authorized to add/update/remove package metadata
OP=$(resim new-simple-badge)

export badge_nfaddress=$(echo "$OP" | sed -nr "s/NFAddress: ([[:alnum:]_]+)/\1/p")
export badge_resource=$(echo "$OP" | sed -nr "s/Resource: ([[:alnum:]_]+)/\1/p")

# # transfer badge to the default account
resim transfer 1 $badge_resource $account

resim show $account

# resim publish .
export package=$(resim publish . --owner-badge $badge_nfaddress | sed -nr "s/Success! New Package: ([[:alnum:]_]+)/\1/p")


# Instantiate a component
export performance_fee=10
OP=$(resim call-function $package TradeVault init_trade_vault $usdc_resource_address $btc_resource_address $account $performance_fee)

export trading_vault_component=$(echo "$OP" | sed -nr "s/.*Component: ([[:alnum:]_]+)/\1/p")
export shares_mint_badge=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '1!d')
export shares_token_vault=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '2!d')

resim show $trading_vault_component

# resim call-method $component create_image "Lion" "https://s2.sum.io/image/xyzdcasdf"
# resim call-method $component create_image "Tiger" "https://s2.sum.io/image/asferawvye"
# resim call-method $component create_image "Butterfly" "https://s2.sum.io/image/nernjdses"

# # resim show $image_art

# # Create new USDC token for payment
# D_OP=$(resim new-token-fixed 1000 --name "US Dollar" --symbol USDC)
# export usdc_token=$(echo "$D_OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '1!d')

# # Get ressource address from the Lion NFT
# resim show $account

# # Instantiate an auction with the Lion NFT and USDC as payment token with a fixed price of 100 USDC
# resim call-function $package FixedPriceSale instantiate_fixed_price_sale "#0a0000000000000000,$image_art" $usdc_token 100

# resim show $account
