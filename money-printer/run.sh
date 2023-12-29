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

# remove :#1#1 from the badge because it does not work in the manifest with it
export badge_resource=$(echo "$badge_resource" | sed 's/:.*//')

# publish package
export package=$(resim publish . | sed -nr "s/Success! New Package: ([[:alnum:]_]+)/\1/p")


# instantiate a component
export manifest_name="instantiate.rtm"
cat << EOF > ./$manifest_name
CALL_METHOD
    Address("$account")
    "lock_fee"
    Decimal("10");
CALL_FUNCTION
    Address("$package")
    "MoneyPrinter"
    "instantiate";
CALL_METHOD
    Address("$account")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
EOF

OP=$(resim run ./$manifest_name)

export component=$(echo "$OP" | sed -nr "s/.*Component: ([[:alnum:]_]+)/\1/p")

# get free USD
export manifest_name="free_token.rtm"
cat << EOF > ./$manifest_name
CALL_METHOD
    Address("$account")
    "lock_fee"
    Decimal("10");
CALL_METHOD
    Address("$component")
    "free_token";
CALL_METHOD
    Address("$account")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
EOF

OP=$(resim run ./$manifest_name)

resim show $account
