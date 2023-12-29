import { IconType } from "react-icons";
import { FaBitcoin, FaDollarSign, FaEthereum, FaQuestion } from "react-icons/fa6";
import { FidenaroIcon } from '../../components/Icon/FidenaroIcon';

export interface AssetMap {
    [key: string]: number;
}

export interface Asset {
    name: string;
    ticker: string;
    symbol: JSX.Element;
    address: string;
    swap_pool: string;
}

export const Bitcoin: Asset = {
    name: "Bitcoin",
    ticker: "BTC",
    symbol: <FidenaroIcon icon={FaBitcoin} color="orange.400" />,
    address: "resource_tdx_2_1thl25uw98gzsjh6kwu6hygm04dmvxaf0yp07shd7knvsmxxhxhlqpy",
    swap_pool: "component_tdx_2_1cqxn9mmsn7ws3f3gwynscmuatxch3cjurqfvgeg6mchlklplrh247p"
};

export const Ethereum: Asset = {
    name: "Ethereum",
    ticker: "ETH",
    symbol: <FidenaroIcon icon={FaEthereum} color="pElement.200" />,
    address: "resource_tdx_2_1t58fyrzezpxsdthwvjskm5wqlh5xtnurkv6txmprd9hzflqjetdae3",
    swap_pool: "component_tdx_2_1cqwaea9esxdung38xuc67pdxvss0refpahnjmuk05jqaphcycse79j"
};

export const USDollar: Asset = {
    name: "US Dollar",
    ticker: "USD",
    symbol: <FidenaroIcon icon={FaDollarSign} color="green.600" />,
    address: "resource_tdx_2_1t4nzjg3hyce4setlykrpcn6uldnj3y94z0pme8wrtap9ktagv57h63",
    swap_pool: "Unknown"
};

export const Unknown: Asset = {
    name: "Unknown",
    ticker: "Unknown",
    symbol: <FidenaroIcon icon={FaQuestion} color="pElement.200" />,
    address: "Unknown",
    swap_pool: "Unknown"
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
            return Unknown;
    }
};