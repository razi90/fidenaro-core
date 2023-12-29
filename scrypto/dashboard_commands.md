// money printer
money_printer_package: package_tdx_2_1pkllrgpq44t8rkfu49necxeql9axz0uh3fnwq0nyzhccpe5v05chu6
money_printer_component: component_tdx_2_1cr5s6adygr6s9ck5y6532yrd9fq8gn2ruy9skwryur309fn2heyjc8
FUSD_resource_address: resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63

radiswap_usd_eth_pool: component_tdx_2_1cqwaea9esxdung38xuc67pdxvss0refpahnjmuk05jqaphcycse79j
radiswap_usd_btc_pool: component_tdx_2_1cqxn9mmsn7ws3f3gwynscmuatxch3cjurqfvgeg6mchlklplrh247p


fidenaro_dapp_account: account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj
fidenaro_package: package_tdx_2_1p4ghqx0dvurphekce8wkamzexq4sxf0xxu29nerjh42j22s0nlkxel
fidenaro_component: component_tdx_2_1czhwtltv8wnywf6t8ylauvl42nfs0qykfjur7a0ukr025qltsy4agh
fidenaro_component_admin_badge: resource_tdx_2_1t53jxzde7y6qttlzkxarwfrs9qz4t2mpyhruxhc2qpdlkwjvaj2fvj
bearos_snap_component: component_tdx_2_1cplgxw6675ss8atu5l8rm2pq77flpqn93aqjl99rveqtnw7w253s0t
bearos_manager_badge: resource_tdx_2_1tkf6sf86cc7wp57758cyfaea9thmmt3t8qg5n9zcw6qwdg9mdqf4pl

// instatiate fidenaro
CALL_FUNCTION
    Address("package_tdx_2_1p4ghqx0dvurphekce8wkamzexq4sxf0xxu29nerjh42j22s0nlkxel")
    "Fidenaro"
    "instantiate"
    Enum<OwnerRole::None>();
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

// create new vault
<!-- CALL_METHOD
    Address("component_tdx_2_1czhwtltv8wnywf6t8ylauvl42nfs0qykfjur7a0ukr025qltsy4agh")
    "new_vault"
    "Razi The Machine"
    Decimal("10")
    "This is the vault of Razi, the world best trader."
    "https://pbs.twimg.com/profile_images/1723034496251953152/w9qqFj0F_400x400.jpg"
    "https://fidenaro.com";
CALL_METHOD
    Address("account_tdx_2_12xmwv55ap2n25uzl9hywpu7ytyzhp9gl6zc9fnz3rssj40nv8pqmkn")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP"); -->

// set stable coin address
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "create_proof_of_amount"
    Address("resource_tdx_2_1t53jxzde7y6qttlzkxarwfrs9qz4t2mpyhruxhc2qpdlkwjvaj2fvj")
    Decimal("1");
CALL_METHOD
    Address("component_tdx_2_1czhwtltv8wnywf6t8ylauvl42nfs0qykfjur7a0ukr025qltsy4agh")
    "add_stable_coin_resource_address"
    Address("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

// add pools to whitelist
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "create_proof_of_amount"
    Address("resource_tdx_2_1t53jxzde7y6qttlzkxarwfrs9qz4t2mpyhruxhc2qpdlkwjvaj2fvj")
    Decimal("1");
CALL_METHOD
    Address("component_tdx_2_1czhwtltv8wnywf6t8ylauvl42nfs0qykfjur7a0ukr025qltsy4agh")
    "new_pool_to_whitelist"
    Address("component_tdx_2_1cqwaea9esxdung38xuc67pdxvss0refpahnjmuk05jqaphcycse79j");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "create_proof_of_amount"
    Address("resource_tdx_2_1t53jxzde7y6qttlzkxarwfrs9qz4t2mpyhruxhc2qpdlkwjvaj2fvj")
    Decimal("1");
CALL_METHOD
    Address("component_tdx_2_1czhwtltv8wnywf6t8ylauvl42nfs0qykfjur7a0ukr025qltsy4agh")
    "new_pool_to_whitelist"
    Address("component_tdx_2_1cqxn9mmsn7ws3f3gwynscmuatxch3cjurqfvgeg6mchlklplrh247p");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");


// deposit
CALL_METHOD
    Address("account_tdx_2_12xmwv55ap2n25uzl9hywpu7ytyzhp9gl6zc9fnz3rssj40nv8pqmkn")
    "withdraw"
    Address("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63")
    Decimal("10000");
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63")
    Bucket("usdf");
CALL_METHOD
    Address("component_tdx_2_1cplgxw6675ss8atu5l8rm2pq77flpqn93aqjl99rveqtnw7w253s0t")
    "deposit"
    Bucket("usdf");
CALL_METHOD
    Address("account_tdx_2_12xmwv55ap2n25uzl9hywpu7ytyzhp9gl6zc9fnz3rssj40nv8pqmkn")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

// swap
CALL_METHOD
    Address("account_tdx_2_12xmwv55ap2n25uzl9hywpu7ytyzhp9gl6zc9fnz3rssj40nv8pqmkn")
    "create_proof_of_amount"
    Address("resource_tdx_2_1tkf6sf86cc7wp57758cyfaea9thmmt3t8qg5n9zcw6qwdg9mdqf4pl")
    Decimal("1");
CALL_METHOD
    Address("component_tdx_2_1cplgxw6675ss8atu5l8rm2pq77flpqn93aqjl99rveqtnw7w253s0t")
    "swap"
    Address("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63")
    Decimal("300")
    Address("component_tdx_2_1cqwaea9esxdung38xuc67pdxvss0refpahnjmuk05jqaphcycse79j");
CALL_METHOD
    Address("account_tdx_2_12xmwv55ap2n25uzl9hywpu7ytyzhp9gl6zc9fnz3rssj40nv8pqmkn")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");


// create user

CALL_METHOD
    Address("component_tdx_2_1czhwtltv8wnywf6t8ylauvl42nfs0qykfjur7a0ukr025qltsy4agh")
    "new_user"
    "BearosSnap"
    "Best trader in the world."
    "https://pbs.twimg.com/profile_images/1723034496251953152/w9qqFj0F_400x400.jpg"
    "my_twitter"
    "my_telegram"
    "N/A";
CALL_METHOD
    Address("account_tdx_2_12xmwv55ap2n25uzl9hywpu7ytyzhp9gl6zc9fnz3rssj40nv8pqmkn")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
