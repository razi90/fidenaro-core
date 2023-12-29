#!/bin/bash
# set -x

# Function to instantiate a Radiswap pool
instantiate_radiswap() {
    local account="$1"
    local package="$2"
    local resource_address1="$3"
    local resource_address2="$4"
    local component_var="$5"
    local manifest_var="$6"

    export manifest_name="$manifest_var"
    cat << EOF > ./tmp/$manifest_name
CALL_METHOD
    Address("$account")
    "lock_fee"
    Decimal("10");
CALL_FUNCTION
    Address("$package")
    "Radiswap"
    "new"
    Enum<OwnerRole::None>()
    Address("$resource_address1")
    Address("$resource_address2");
CALL_METHOD
    Address("$account")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
EOF

    OP=$(resim run ./tmp/$manifest_name)
    export "$component_var"=$(echo "$OP" | sed -nr "s/.*Component: ([[:alnum:]_]+)/\1/p" | sed '1!d')
}

add_liquidity() {
    local account="$1"
    local resource_address1="$2"
    local resource_address2="$3"
    local component_var="$4"
    local manifest_var="$5"
    local amount="$6"

    export manifest_name="$manifest_var"
    cat << EOF > ./tmp/$manifest_name
CALL_METHOD
    Address("$account")
    "lock_fee"
    Decimal("10");
CALL_METHOD Address("$account")
    "withdraw"
    Address("$resource_address1")
    Decimal("$amount");
CALL_METHOD Address("$account")
    "withdraw"
    Address("$resource_address2")
    Decimal("1");
TAKE_ALL_FROM_WORKTOP
    Address("$resource_address1")
    Bucket("$resource_address1");
TAKE_ALL_FROM_WORKTOP
    Address("$resource_address2")
    Bucket("$resource_address2");
CALL_METHOD
    Address("$component_var")
    "add_liquidity"
    Bucket("$resource_address1")
    Bucket("$resource_address2");
CALL_METHOD
    Address("$account")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
EOF

    OP=$(resim run ./tmp/$manifest_name)
}

# Specify the directory path you want to create
tmp_path="./tmp"

# Check if the directory already exists
if [ -d "$tmp_path" ]; then
  # If it exists, delete it
  rm -rf "$tmp_path"
fi
mkdir -p "$tmp_path"

export counter=0

resim reset

############################################################## SETUP USER ACCOUNT AND TOKEN ###############################################################

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

# remove :#1#1 from the badge because it does not work in the manifest with it
export badge_resource=$(echo "$badge_resource" | sed 's/:.*//')

# create a new stable coin
OP=$(resim new-token-fixed --name USDC --symbol USDC 100000000000)
export usdc_resource_address=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '1!d')

# create bitcoin
OP=$(resim new-token-fixed --name Bitcoin --symbol BTC 21000000)
export btc_resource_address=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '1!d')

# create ethereum
OP=$(resim new-token-fixed --name Ethereum --symbol ETH 500000000)
export eth_resource_address=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '1!d')

############################################################## SETUP Radiswap  ###############################################################################

# publish radiswap package
export radiswap_package=$(resim publish ../../radixdlt-scrypto/assets/blueprints/radiswap | sed -nr "s/Success! New Package: ([[:alnum:]_]+)/\1/p")

# Instantiate Radiswap BTC/USDC pool
instantiate_radiswap "$account" "$radiswap_package" "$usdc_resource_address" "$btc_resource_address" "btc_usdc_radiswap_component" "${counter}_instantiate_radiswap_btc_usdc.rtm"
counter=$((counter + 1))

# Add liquidity to BTC/USDC pool
add_liquidity "$account" "$usdc_resource_address" "$btc_resource_address" "$btc_usdc_radiswap_component" "${counter}_add_liquidity_btc_usdc.rtm" "36000"
counter=$((counter + 1))

# Instantiate Radiswap ETH/USDC pool
instantiate_radiswap "$account" "$radiswap_package" "$usdc_resource_address" "$eth_resource_address" "eth_usdc_radiswap_component" "${counter}_instantiate_radiswap_eth_usdc.rtm"
counter=$((counter + 1))

# Add liquidity to ETH/USDC pool
add_liquidity "$account" "$usdc_resource_address" "$eth_resource_address" "$eth_usdc_radiswap_component" "${counter}_add_liquidity_eth_usdc.rtm" "2000"
counter=$((counter + 1))

############################################################## SETUP FIDENARO VAULT ###############################################################################

export fidenaro_package=$(resim publish . | sed -nr "s/Success! New Package: ([[:alnum:]_]+)/\1/p")

# instantiate a component
export manifest_name="{$counter}_instantiate_fidenaro.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD
    Address("$account")
    "lock_fee"
    Decimal("10");
CALL_FUNCTION
    Address("$fidenaro_package")
    "Fidenaro"
    "instantiate"
    Enum<OwnerRole::None>();
CALL_METHOD
    Address("$account")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
EOF

OP=$(resim run ./tmp/$manifest_name)

export fidenaro_component=$(echo "$OP" | sed -nr "s/.*Component: ([[:alnum:]_]+)/\1/p")
export fidenaro_admin_badge=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '1!d')

# whitelist pools
export manifest_name="{$counter}_whitelist_btc.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD
    Address("$account")
    "lock_fee"
    Decimal("10");
CALL_METHOD
    Address("$account")
    "create_proof_of_amount"
    Address("$fidenaro_admin_badge")
    Decimal("1");
CALL_METHOD
    Address("$fidenaro_component")
    "new_pool_to_whitelist"
    Address("$btc_usdc_radiswap_component");
EOF

OP=$(resim run ./tmp/$manifest_name)

export manifest_name="{$counter}_whitelist_eth.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD
    Address("$account")
    "lock_fee"
    Decimal("10");
CALL_METHOD
    Address("$account")
    "create_proof_of_amount"
    Address("$fidenaro_admin_badge")
    Decimal("1");
CALL_METHOD
    Address("$fidenaro_component")
    "new_pool_to_whitelist"
    Address("$eth_usdc_radiswap_component");
EOF

OP=$(resim run ./tmp/$manifest_name)

############################################################## SETUP NEW FUND #####################################################################################
export manifest_name="{$counter}_set_stable_coin_resource_address.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD
    Address("$account")
    "lock_fee"
    Decimal("10");
CALL_METHOD
    Address("$account")
    "create_proof_of_amount"
    Address("$fidenaro_admin_badge")
    Decimal("1");
CALL_METHOD
    Address("$fidenaro_component")
    "add_stable_coin_resource_address"
    Address("$usdc_resource_address");
EOF

OP=$(resim run ./tmp/$manifest_name)


export manifest_name="{$counter}_create_new_user.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD
    Address("$account")
    "lock_fee"
    Decimal("10");
CALL_METHOD
    Address("$fidenaro_component")
    "new_user"
    "BearosSnap"
    "Best trader in the world."
    "https://pbs.twimg.com/profile_images/1723034496251953152/w9qqFj0F_400x400.jpg"
    "my_twitter"
    "my_telegram"
    "N/A";
CALL_METHOD
    Address("$account")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
EOF

OP=$(resim run ./tmp/$manifest_name)

export user_token_resource_address=resource_sim1n2wpeygqzaz4rsf0urhv6mf2m386dzr9ggemuqjw0ztnj7gqkvuyvn

export manifest_name="{$counter}_update_user_data.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD
    Address("$account")
    "lock_fee"
    Decimal("10")
    ;
CALL_METHOD Address("$account") "withdraw" Address("$user_token_resource_address") Decimal("1")
    ;
TAKE_NON_FUNGIBLES_FROM_WORKTOP
    Address("$user_token_resource_address")
    Array<NonFungibleLocalId>(NonFungibleLocalId("#0#"))
    Bucket("user_token")
    ;
CREATE_PROOF_FROM_BUCKET_OF_NON_FUNGIBLES
    Bucket("user_token")
    Array<NonFungibleLocalId>(NonFungibleLocalId("#0#"))
    Proof("proof1b")
    ;
CALL_METHOD
    Address("$fidenaro_component")
    "update_user_data"
    Proof("proof1b")
    Map<String, String>(
        "user_name" => "Razi Corleone",
        "twitter" => "ThanosOfCrypto",
        "telegram" => ""
    )
    ;
RETURN_TO_WORKTOP Bucket("user_token");
CALL_METHOD
    Address("$account")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
    ;
EOF

resim run ./tmp/$manifest_name

export manifest_name="{$counter}_create_vault.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD
    Address("$account")
    "lock_fee"
    Decimal("10")
    ;
CALL_METHOD
    Address("$account")
    "withdraw"
    Address("$user_token_resource_address")
    Decimal("1")
    ;
TAKE_NON_FUNGIBLES_FROM_WORKTOP
    Address("$user_token_resource_address")
    Array<NonFungibleLocalId>(NonFungibleLocalId("#0#"))
    Bucket("user_token")
    ;
CALL_METHOD
    Address("$fidenaro_component")
    "new_vault"
    Bucket("user_token")
    "WizardVault"
    "short description"
    ;
CALL_METHOD
    Address("$account")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
    ;
EOF

OP=$(resim run ./tmp/$manifest_name)

export trading_vault_component=$(echo "$OP" | sed -nr "s/.*Component: ([[:alnum:]_]+)/\1/p")
export trading_vault_badge=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '1!d')
export shares_token_address=$(echo "$OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '2!d')

# echo $OP

# echo $shares_token_address
# echo $trading_vault_badge

############################################################## DEPOSIT AND TRADE ##################################################################################

# deposit 1000 usdc into the vault
export manifest_name="{$counter}_deposit.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD Address("$account") "lock_fee" Decimal("10");
CALL_METHOD Address("$account") "withdraw" Address("$user_token_resource_address") Decimal("1");
TAKE_NON_FUNGIBLES_FROM_WORKTOP
  Address("$user_token_resource_address")
  Array<NonFungibleLocalId>(NonFungibleLocalId("#0#"))
  Bucket("user_token");
CREATE_PROOF_FROM_BUCKET_OF_NON_FUNGIBLES
  Bucket("user_token")
  Array<NonFungibleLocalId>(NonFungibleLocalId("#0#"))
  Proof("proof1b");
CALL_METHOD Address("$account") "withdraw" Address("$usdc_resource_address") Decimal("1000");
TAKE_ALL_FROM_WORKTOP Address("$usdc_resource_address") Bucket("usdc");
CALL_METHOD Address("$trading_vault_component") "deposit" Proof("proof1b") Bucket("usdc");
RETURN_TO_WORKTOP Bucket("user_token");
CALL_METHOD Address("$account") "deposit_batch" Expression("ENTIRE_WORKTOP");
EOF

resim run ./tmp/$manifest_name


# change short description
export manifest_name="{$counter}_change_short_description.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD Address("$account") "lock_fee" Decimal("10");
CALL_METHOD
    Address("$account")
    "create_proof_of_amount"
    Address("$trading_vault_badge")
    Decimal("1")
;
CALL_METHOD Address("$trading_vault_component") "change_short_description" "New short description";
EOF

resim run ./tmp/$manifest_name

# swap USDC to BTC
export manifest_name="{$counter}_usdc_to_btc_swap.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD Address("$account") "lock_fee" Decimal("10");
CALL_METHOD
    Address("$account")
    "create_proof_of_amount"
    Address("$trading_vault_badge")
    Decimal("1")
;
CALL_METHOD
    Address("$trading_vault_component")
    "swap"
    Address("$usdc_resource_address")
    Decimal("300")
    Address("$btc_usdc_radiswap_component");
CALL_METHOD
    Address("$account")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
EOF

resim run ./tmp/$manifest_name


# swap USDC to BTC
export manifest_name="{$counter}_usdc_to_eth_swap.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD Address("$account") "lock_fee" Decimal("10");
CALL_METHOD
    Address("$account")
    "create_proof_of_amount"
    Address("$trading_vault_badge")
    Decimal("1")
;
CALL_METHOD
    Address("$trading_vault_component")
    "swap"
    Address("$usdc_resource_address")
    Decimal("300")
    Address("$eth_usdc_radiswap_component");
CALL_METHOD
    Address("$account")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
EOF

resim run ./tmp/$manifest_name


# update description of the vault in metadata
export manifest_name="{$counter}_set_metadata.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD Address("$account") "lock_fee" Decimal("10");
CALL_METHOD
    Address("$account")
    "create_proof_of_amount"
    Address("$trading_vault_badge")
    Decimal("1")
;
SET_METADATA
    Address("$trading_vault_component")
    "description"
    Enum<Metadata::String>(
        "We HODL"
    );
EOF

resim run ./tmp/$manifest_name

resim show $account

# withdraw assets for 500 share tokens from the vault
export manifest_name="{$counter}_withdraw.rtm"
counter=$((counter + 1))
cat << EOF > ./tmp/$manifest_name
CALL_METHOD Address("$account") "lock_fee" Decimal("10");
CALL_METHOD Address("$account") "withdraw" Address("$user_token_resource_address") Decimal("1");
TAKE_NON_FUNGIBLES_FROM_WORKTOP
  Address("$user_token_resource_address")
  Array<NonFungibleLocalId>(NonFungibleLocalId("#0#"))
  Bucket("user_token");
CREATE_PROOF_FROM_BUCKET_OF_NON_FUNGIBLES
  Bucket("user_token")
  Array<NonFungibleLocalId>(NonFungibleLocalId("#0#"))
  Proof("proof1b");
CALL_METHOD Address("$account") "withdraw" Address("$shares_token_address") Decimal("500");
TAKE_ALL_FROM_WORKTOP Address("$shares_token_address") Bucket("shares");
CALL_METHOD Address("$trading_vault_component") "withdraw" Proof("proof1b") Bucket("shares");
RETURN_TO_WORKTOP Bucket("user_token");
CALL_METHOD Address("$account") "deposit_batch" Expression("ENTIRE_WORKTOP");
EOF

resim run ./tmp/$manifest_name

resim show $account

# resim show $trading_vault_component