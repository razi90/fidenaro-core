import { IconType } from "react-icons";
import { FaBitcoin, FaDollarSign, FaEthereum, FaQuestion } from "react-icons/fa";

export interface Asset {
    name: string;
    ticker: string;
    symbol: IconType;
    address: string;
}

export const Bitcoin: Asset = {
    name: "Bitcoin",
    ticker: "BTC",
    symbol: FaBitcoin,
    address: "resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy"
};

export const Ethereum: Asset = {
    name: "Ethereum",
    ticker: "ETH",
    symbol: FaEthereum,
    address: "resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3"
};

export const USDollar: Asset = {
    name: "US Dollar",
    ticker: "USD",
    symbol: FaDollarSign,
    address: "resource_tdx_2_1tkk467s802k4r44jltc5c5np7e53lurekcs2cxu5jja5xcs7mk64ld"
};

export const Unknown: Asset = {
    name: "Unknown",
    ticker: "Unknown",
    symbol: FaQuestion,
    address: "Unknown"
};

export function addressToAsset(address: string): Asset {
    switch (address) {
        case "resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy":
            return Bitcoin;
        case "resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3":
            return Ethereum;
        case "resource_tdx_2_1tkk467s802k4r44jltc5c5np7e53lurekcs2cxu5jja5xcs7mk64ld":
            return USDollar;
        default:
            return Unknown;
    }
};