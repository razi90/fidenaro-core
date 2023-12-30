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
    address: "resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy",
    radiswap_address: "component_tdx_2_1cp66u08j9f9zr4kafv6hfy8486ezu3zldgwd76s75t0yq62f2mcy89",
    pool_address: "pool_tdx_2_1c49nmgnadnqhkycfwwu45ezrn23gm6kgarc5qh43fdvxpejuxskfuy",
};

export const Ethereum: Asset = {
    name: "Ethereum",
    ticker: "ETH",
    symbol: <FidenaroIcon icon={FaEthereum} color="pElement.200" />,
    address: "resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3",
    radiswap_address: "component_tdx_2_1cp6ye55hvfz4mp33ys766qecg26rrtkrxvhex70nnax2eppf9ssued",
    pool_address: "pool_tdx_2_1c522u9u2chs8q4c9jfl0u0pghmegt98wkl6t507wqajnmtc8y7cads",
};

export const USDollar: Asset = {
    name: "US Dollar",
    ticker: "USD",
    symbol: <FidenaroIcon icon={FaDollarSign} color="green.600" />,
    address: "resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63",
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
        case "resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy":
            return Bitcoin;
        case "resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3":
            return Ethereum;
        case "resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63":
            return USDollar;
        default:
            return USDollar;
    }
};