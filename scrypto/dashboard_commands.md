// money printer
money_printer_package: package_tdx_2_1ph2x68gt08czq20vq27ajp3shf4uv4jum7k788yk0gckrt4a5cwq4q
money_printer_component: component_tdx_2_1crn7v7ssxrhf6zla48ffxxvk6ljd7v6pmrym2akx7n5kcpradkp06z
FUSD_resource_address: resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz

radiswap_usd_eth_pool: component_tdx_2_1crwj7ggc4uvgmrn206jv0zkqw4u6r4ucrt6nlgkjsq90a4puqk4tcp
radiswap_usd_btc_pool: component_tdx_2_1crtmr37fh8x8g9u70cuujzhrgrvju64xe638see906wwqrkmfa7ssd

fidenaro_dapp_account: account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj
fidenaro_package: package_tdx_2_1phumgfft4vsdxsygul6vmjpmxq8g63fys8wwvlzjd2vtkpfqwma23j
fidenaro_component: component_tdx_2_1crh93fa5jg6cuwy8vpekkn487xv3x4nlfkny7576gp7y7vxpj5mr2x
fidenaro_component_admin_badge: resource_tdx_2_1t4cv4jwepeqq3p24fwp2mh7vkhkt0g3w99ut58u3evnm0pqkxutkr8

// create radiswap bitcoin pool
CALL_FUNCTION
    Address("package_tdx_2_1phlwavgq39japmv8k2sev946tcs8u2lt8czeyy6rwupuuvwmceapkj")
    "Radiswap"
    "new"
    Enum<0u8>()
    Address("resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz")
    Address("resource_tdx_2_1tha9cuxskpvauvk334hjzjshx8e2tgkvut60gzefsf6rkmdrmmmwkq")
;
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;

// create radiswap ethereum pool
CALL_FUNCTION
    Address("package_tdx_2_1phlwavgq39japmv8k2sev946tcs8u2lt8czeyy6rwupuuvwmceapkj")
    "Radiswap"
    "new"
    Enum<0u8>()
    Address("resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz")
    Address("resource_tdx_2_1t4xmth6aznqwudljmh26symdvfvy6u4xde9m2ehuw9ga3etd0l25ns")
;
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;

// provide liquidity BTC
CALL_METHOD Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "withdraw"
    Address("resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz")
    Decimal("69633");
CALL_METHOD Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "withdraw"
    Address("resource_tdx_2_1tha9cuxskpvauvk334hjzjshx8e2tgkvut60gzefsf6rkmdrmmmwkq")
    Decimal("1");
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz")
    Bucket("resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz");
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1tha9cuxskpvauvk334hjzjshx8e2tgkvut60gzefsf6rkmdrmmmwkq")
    Bucket("resource_tdx_2_1tha9cuxskpvauvk334hjzjshx8e2tgkvut60gzefsf6rkmdrmmmwkq");
CALL_METHOD
    Address("component_tdx_2_1crtmr37fh8x8g9u70cuujzhrgrvju64xe638see906wwqrkmfa7ssd")
    "add_liquidity"
    Bucket("resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz")
    Bucket("resource_tdx_2_1tha9cuxskpvauvk334hjzjshx8e2tgkvut60gzefsf6rkmdrmmmwkq");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

// provide liquidity ETH
CALL_METHOD Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "withdraw"
    Address("resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz")
    Decimal("370000");
CALL_METHOD Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "withdraw"
    Address("resource_tdx_2_1t4xmth6aznqwudljmh26symdvfvy6u4xde9m2ehuw9ga3etd0l25ns")
    Decimal("10");
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz")
    Bucket("resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz");
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1t4xmth6aznqwudljmh26symdvfvy6u4xde9m2ehuw9ga3etd0l25ns")
    Bucket("resource_tdx_2_1t4xmth6aznqwudljmh26symdvfvy6u4xde9m2ehuw9ga3etd0l25ns");
CALL_METHOD
    Address("component_tdx_2_1crwj7ggc4uvgmrn206jv0zkqw4u6r4ucrt6nlgkjsq90a4puqk4tcp")
    "add_liquidity"
    Bucket("resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz")
    Bucket("resource_tdx_2_1t4xmth6aznqwudljmh26symdvfvy6u4xde9m2ehuw9ga3etd0l25ns");
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
    Address("component_tdx_2_1crtmr37fh8x8g9u70cuujzhrgrvju64xe638see906wwqrkmfa7ssd")
    "remove_liquidity"
    Bucket("resource_tdx_2_1tkvydle22v3rmwm6up8m5fjpkl6sar8vvep0smra8emurql7jd8znp");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

// instatiate fidenaro
CALL_FUNCTION
    Address("package_tdx_2_1phumgfft4vsdxsygul6vmjpmxq8g63fys8wwvlzjd2vtkpfqwma23j")
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
    Address("resource_tdx_2_1t4cv4jwepeqq3p24fwp2mh7vkhkt0g3w99ut58u3evnm0pqkxutkr8")
    Decimal("1");
CALL_METHOD
    Address("component_tdx_2_1crh93fa5jg6cuwy8vpekkn487xv3x4nlfkny7576gp7y7vxpj5mr2x")
    "add_stable_coin_resource_address"
    Address("resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

// add pools to whitelist
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "create_proof_of_amount"
    Address("resource_tdx_2_1t4cv4jwepeqq3p24fwp2mh7vkhkt0g3w99ut58u3evnm0pqkxutkr8")
    Decimal("1");
CALL_METHOD
    Address("component_tdx_2_1crh93fa5jg6cuwy8vpekkn487xv3x4nlfkny7576gp7y7vxpj5mr2x")
    "new_pool_to_whitelist"
    Address("component_tdx_2_1crtmr37fh8x8g9u70cuujzhrgrvju64xe638see906wwqrkmfa7ssd");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");

CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "create_proof_of_amount"
    Address("resource_tdx_2_1t4cv4jwepeqq3p24fwp2mh7vkhkt0g3w99ut58u3evnm0pqkxutkr8")
    Decimal("1");
CALL_METHOD
    Address("component_tdx_2_1crh93fa5jg6cuwy8vpekkn487xv3x4nlfkny7576gp7y7vxpj5mr2x")
    "new_pool_to_whitelist"
    Address("component_tdx_2_1crwj7ggc4uvgmrn206jv0zkqw4u6r4ucrt6nlgkjsq90a4puqk4tcp");
CALL_METHOD
    Address("account_tdx_2_12954qeldtzat828639l460w4utrvv3dmt8unmhthga5ak3tj3rd7wj")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
