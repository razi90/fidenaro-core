#!/bin/bash
# set -x

resim reset

OP=$(resim new-account)

# resim new-account (wallet)
export account=$(echo "$OP" | sed -nr "s/Account component address: ([[:alnum:]_]+)/\1/p")
export privkey=$(echo "$OP" | sed -nr "s/Private key: ([[:alnum:]_]+)/\1/p")
export pub=$(echo "$OP" | sed -nr "s/Public key: ([[:alnum:]_]+)/\1/p")


# create a simple nft badge.
# the owner badge must be presented in order to be authorized to add/update/remove package metadata
OP=$(resim new-simple-badge)

export badge_resource=$(echo "$OP" | sed -nr "s/NonFungibleGlobalId: ([[:alnum:]_]+)/\1/p")

resim set-default-account $account $privkey $badge_resource

# create a new stable coin
OP=$(resim new-token-fixed --name USDC --symbol USDC 100000000000)
export usdc_resource_address=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '1!d')

# create bitcoin
OP=$(resim new-token-fixed --name Bitcoin --symbol BTC 21000000)
export btc_resource_address=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '1!d')

pushd "../scrypto-examples/defi/radiswap"
# publish Radiswap
export radiswap_package=$(resim publish . | sed -nr "s/Success! New Package: ([[:alnum:]_]+)/\1/p")
popd

# Instantiate Radiswap component
OP=$(resim call-function $radiswap_package Radiswap instantiate_pool $usdc_resource_address $btc_resource_address $account $performance_fee)

# 
cat << EOF > ./tmp/init_lp_pool.rtm
CALL_METHOD ComponentAddress("$account") "lock_fee" Decimal("10");
CALL_METHOD ComponentAddress("$account") "withdraw_by_amount" Decimal("210000") ResourceAddress("$usdc_resource_address");
CALL_METHOD ComponentAddress("$account") "withdraw_by_amount" Decimal("10") ResourceAddress("$btc_resource_address");
TAKE_FROM_WORKTOP ResourceAddress("$usdc_resource_address") Bucket("usdc");
TAKE_FROM_WORKTOP ResourceAddress("$btc_resource_address") Bucket("btc");
CALL_FUNCTION PackageAddress("$radiswap_package") "Radiswap" "instantiate_pool" Bucket("usdc") Bucket("btc") Decimal("10000") "USDCBTC" "Liquidity for USDC and BTC" "LP_URL" Decimal("0");
CALL_METHOD ComponentAddress("$account") "deposit_batch" Expression("ENTIRE_WORKTOP");
EOF

resim run ./tmp/init_lp_pool.rtm

# CALL_METHOD ComponentAddress("$trading_vault_component") "deposit" Bucket("usdc");
# CALL_METHOD ComponentAddress("$account") "deposit_batch" Expression("ENTIRE_WORKTOP");
exit

# publish Fidenaro trading vault
export fidenaro_package=$(resim publish . | sed -nr "s/Success! New Package: ([[:alnum:]_]+)/\1/p")

# Instantiate a component
export performance_fee=10
OP=$(resim call-function $fidenaro_package TradeVault init_trade_vault $usdc_resource_address $btc_resource_address $account $performance_fee)

export trading_vault_component=$(echo "$OP" | sed -nr "s/.*Component: ([[:alnum:]_]+)/\1/p")
export shares_mint_badge=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '1!d')
export shares_token_address=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '2!d')

# deposit 1000 usdc into the vault
cat << EOF > ./tmp/deposit.rtm
CALL_METHOD ComponentAddress("$account") "lock_fee" Decimal("10");
CALL_METHOD ComponentAddress("$account") "withdraw_by_amount" Decimal("1000") ResourceAddress("$usdc_resource_address");
TAKE_FROM_WORKTOP ResourceAddress("$usdc_resource_address") Bucket("usdc");
CALL_METHOD ComponentAddress("$trading_vault_component") "deposit" Bucket("usdc");
CALL_METHOD ComponentAddress("$account") "deposit_batch" Expression("ENTIRE_WORKTOP");
EOF

resim run ./tmp/deposit.rtm

# withdraw 500 usdc from the vault
cat << EOF > ./tmp/withdraw.rtm
CALL_METHOD ComponentAddress("$account") "lock_fee" Decimal("10");
CALL_METHOD ComponentAddress("$account") "withdraw_by_amount" Decimal("500") ResourceAddress("$shares_token_address");
TAKE_FROM_WORKTOP ResourceAddress("$shares_token_address") Bucket("shares");
CALL_METHOD ComponentAddress("$trading_vault_component") "withdraw" Bucket("shares");
CALL_METHOD ComponentAddress("$account") "deposit_batch" Expression("ENTIRE_WORKTOP");
EOF

resim run ./tmp/withdraw.rtm

# open trade
cat << EOF > ./tmp/open_trade.rtm
CALL_METHOD ComponentAddress("$account") "lock_fee" Decimal("10");
CALL_METHOD ComponentAddress("$trading_vault_component") "open_trade" ResourceAddress("$usdc_resource_address") ResourceAddress("$btc_resource_address") Decimal("300");
EOF

resim run ./tmp/open_trade.rtm

# resim show $account
# resim show $trading_vault_component