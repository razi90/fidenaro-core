// money printer
money_printer_package: package_tdx_2_1pkllrgpq44t8rkfu49necxeql9axz0uh3fnwq0nyzhccpe5v05chu6
money_printer_component: component_tdx_2_1cr5s6adygr6s9ck5y6532yrd9fq8gn2ruy9skwryur309fn2heyjc8
FUSD_resource_address: resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63

radiswap_usd_eth_pool: component_tdx_2_1cqwaea9esxdung38xuc67pdxvss0refpahnjmuk05jqaphcycse79j
radiswap_usd_btc_pool: component_tdx_2_1cqxn9mmsn7ws3f3gwynscmuatxch3cjurqfvgeg6mchlklplrh247p


fidenaro_dapp_account: account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj
fidenaro_package: package_tdx_2_1p4cv2npjtjjdtrcmqeuftdppws2fpzhcapqj9mmdqvwn8uqa43w5x8
fidenaro_component: component_tdx_2_1cp2yk0289jx060tnthh52rqm9lhr89ww595fmtvxdw3gkkev9ekhug
fidenaro_component_admin_badge: resource_tdx_2_1t4sax7h2az9tkpdg6yrmt6yeu4c04a04ujdfdu5ah5puvvaer8j36k


// create radiswap bitcoin pool
CALL_FUNCTION
    Address("package_tdx_2_1p4at2str4wmwv2g9xm9n3fvsn6v707c26sfsf0pkz8tk3y4gjaan2c")
    "Radiswap"
    "new"
    Enum<0u8>()
    Address("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63")
    Address("resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy")
;
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;


// create radiswap ethereum pool
CALL_FUNCTION
    Address("package_tdx_2_1p4at2str4wmwv2g9xm9n3fvsn6v707c26sfsf0pkz8tk3y4gjaan2c")
    "Radiswap"
    "new"
    Enum<0u8>()
    Address("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63")
    Address("resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3")
;
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;

// provide liquidity BTC
CALL_METHOD Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "withdraw"
    Address("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63")
    Decimal("41907");
CALL_METHOD Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "withdraw"
    Address("resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy")
    Decimal("1");
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63")
    Bucket("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63");
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy")
    Bucket("resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy");
CALL_METHOD
    Address("component_tdx_2_1cp66u08j9f9zr4kafv6hfy8486ezu3zldgwd76s75t0yq62f2mcy89")
    "add_liquidity"
    Bucket("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63")
    Bucket("resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

// provide liquidity ETH
CALL_METHOD Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "withdraw"
    Address("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63")
    Decimal("22870");
CALL_METHOD Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "withdraw"
    Address("resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3")
    Decimal("10");
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63")
    Bucket("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63");
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3")
    Bucket("resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3");
CALL_METHOD
    Address("component_tdx_2_1cp6ye55hvfz4mp33ys766qecg26rrtkrxvhex70nnax2eppf9ssued")
    "add_liquidity"
    Bucket("resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63")
    Bucket("resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

// remove liquidity BTC
CALL_METHOD Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "withdraw"
    Address("resource_tdx_2_1tkvydle22v3rmwm6up8m5fjpkl6sar8vvep0smra8emurql7jd8znp")
    Decimal("600");
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1tkvydle22v3rmwm6up8m5fjpkl6sar8vvep0smra8emurql7jd8znp")
    Bucket("resource_tdx_2_1tkvydle22v3rmwm6up8m5fjpkl6sar8vvep0smra8emurql7jd8znp");
CALL_METHOD
    Address("component_tdx_2_1cp66u08j9f9zr4kafv6hfy8486ezu3zldgwd76s75t0yq62f2mcy89")
    "remove_liquidity"
    Bucket("resource_tdx_2_1tkvydle22v3rmwm6up8m5fjpkl6sar8vvep0smra8emurql7jd8znp");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

// Swap BTC to USD
CALL_METHOD Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "withdraw"
    Address("resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy")
    Decimal("1");
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy")
    Bucket("resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy");
CALL_METHOD
    Address("component_tdx_2_1cp66u08j9f9zr4kafv6hfy8486ezu3zldgwd76s75t0yq62f2mcy89")
    "swap"
    Bucket("resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

// Swap ETH to USD
CALL_METHOD Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "withdraw"
    Address("resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3")
    Decimal("5");
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3")
    Bucket("resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3");
CALL_METHOD
    Address("component_tdx_2_1cp6ye55hvfz4mp33ys766qecg26rrtkrxvhex70nnax2eppf9ssued")
    "swap"
    Bucket("resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");


// instatiate fidenaro
CALL_FUNCTION
    Address("package_tdx_2_1p4cv2npjtjjdtrcmqeuftdppws2fpzhcapqj9mmdqvwn8uqa43w5x8")
    "Fidenaro"
    "instantiate"
    Enum<OwnerRole::None>();
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

// set stable coin address
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "create_proof_of_amount"
    Address("resource_tdx_2_1t4sax7h2az9tkpdg6yrmt6yeu4c04a04ujdfdu5ah5puvvaer8j36k")
    Decimal("1");
CALL_METHOD
    Address("component_tdx_2_1cp2yk0289jx060tnthh52rqm9lhr89ww595fmtvxdw3gkkev9ekhug")
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
    Address("resource_tdx_2_1t4sax7h2az9tkpdg6yrmt6yeu4c04a04ujdfdu5ah5puvvaer8j36k")
    Decimal("1");
CALL_METHOD
    Address("component_tdx_2_1cp2yk0289jx060tnthh52rqm9lhr89ww595fmtvxdw3gkkev9ekhug")
    "new_pool_to_whitelist"
    Address("component_tdx_2_1cp66u08j9f9zr4kafv6hfy8486ezu3zldgwd76s75t0yq62f2mcy89");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "create_proof_of_amount"
    Address("resource_tdx_2_1t4sax7h2az9tkpdg6yrmt6yeu4c04a04ujdfdu5ah5puvvaer8j36k")
    Decimal("1");
CALL_METHOD
    Address("component_tdx_2_1cp2yk0289jx060tnthh52rqm9lhr89ww595fmtvxdw3gkkev9ekhug")
    "new_pool_to_whitelist"
    Address("component_tdx_2_1cp6ye55hvfz4mp33ys766qecg26rrtkrxvhex70nnax2eppf9ssued");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");