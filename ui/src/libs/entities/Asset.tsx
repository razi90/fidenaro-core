import { FaBitcoin, FaDollarSign, FaEthereum, FaQuestion } from "react-icons/fa6";
import { FidenaroIcon } from '../../components/Icon/FidenaroIcon';

export interface Asset {
    name: string;
    ticker: string;
    symbol: JSX.Element;
    address: string;
    radiswap_address: string;
    pool_address: string;
}

export const Bitcoin: Asset = {
    name: "Bitcoin",
    ticker: "BTC",
    symbol: <FidenaroIcon icon={FaBitcoin} color="orange.400" />,
    address: "resource_tdx_2_1tha9cuxskpvauvk334hjzjshx8e2tgkvut60gzefsf6rkmdrmmmwkq",
    radiswap_address: "component_tdx_2_1crtmr37fh8x8g9u70cuujzhrgrvju64xe638see906wwqrkmfa7ssd",
    pool_address: "pool_tdx_2_1c4td9gt2uknh2gf2uwalpwqrqnkj0z2xa6d5mr4jcnk2uxfhc2eaun",
};

export const Ethereum: Asset = {
    name: "Ethereum",
    ticker: "ETH",
    symbol: <FidenaroIcon icon={FaEthereum} color="pElement.200" />,
    address: "resource_tdx_2_1t4xmth6aznqwudljmh26symdvfvy6u4xde9m2ehuw9ga3etd0l25ns",
    radiswap_address: "component_tdx_2_1crwj7ggc4uvgmrn206jv0zkqw4u6r4ucrt6nlgkjsq90a4puqk4tcp",
    pool_address: "pool_tdx_2_1ckktmzsj3qw6y2rdqcaz4d7zqk7ermqycreadwx5kn8hlwhcrnruu4",
};

export const USDollar: Asset = {
    name: "US Dollar",
    ticker: "USD",
    symbol: <FidenaroIcon icon={FaDollarSign} color="green.600" />,
    address: "resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz",
    radiswap_address: "Unknown",
    pool_address: "Unknown",
};

export const Unknown: Asset = {
    name: "Unknown",
    ticker: "Unknown",
    symbol: <FidenaroIcon icon={FaQuestion} color="pElement.200" />,
    address: "Unknown",
    radiswap_address: "Unknown",
    pool_address: "Unknown",
};

export function addressToAsset(address: string): Asset {
    switch (address) {
        case "resource_tdx_2_1tha9cuxskpvauvk334hjzjshx8e2tgkvut60gzefsf6rkmdrmmmwkq":
            return Bitcoin;
        case "resource_tdx_2_1t4xmth6aznqwudljmh26symdvfvy6u4xde9m2ehuw9ga3etd0l25ns":
            return Ethereum;
        case "resource_tdx_2_1thvujr4nrueay2q4ny4ppagty0qyywa6af7ehm4ch996cljpcsnncz":
            return USDollar;
        default:
            return USDollar;
    }
};