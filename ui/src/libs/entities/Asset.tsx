import { FaBitcoin, FaCannabis, FaDollarSign, FaEthereum, FaHandshake, FaQuestion } from "react-icons/fa6";
import { FidenaroIcon, FidenaroImageIcon } from '../../components/Icon/FidenaroIcon';

export interface Asset {
    name: string;
    ticker: string;
    symbol: JSX.Element;
    address: string;
    price_key: string;
}

export const Radix: Asset = {
    name: "Radix",
    ticker: "XRD",
    symbol: <FidenaroImageIcon imageSrc="/images/LogoRadix.png" altText="Radix Logo" />,
    address: "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc",
    price_key: "5c2102805d871d77971fa419bfc4659768f350a4178d95836a12f35da4d950c7974c805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6",
};

export const Bitcoin: Asset = {
    name: "Radix Wrapped Bitcoin",
    ticker: "xwBTC",
    symbol: <FidenaroIcon icon={FaBitcoin} color="orange.400" />,
    address: "resource_tdx_2_1t4vmx0vezqqrcqhzlt0sxcphw63n73fsxve3nvrn8y5c5dyxk3fxuf",
    price_key: "5c2102805d59b33d9910003c02e2fadf03603776a33f4530333319b07339298a3486805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6",
};

export const Ethereum: Asset = {
    name: "Radix Wrapped Ether",
    ticker: "xETH",
    symbol: <FidenaroIcon icon={FaEthereum} color="pElement.200" />,
    address: "resource_tdx_2_1tkky3adz9kjyv534amy29uxrqg28uvr8ygm09g4wwr37zajrn0zldg",
    price_key: "5c2102805dac48f5a22da4465235eec8a2f0c302147e30672236f2a2ae70e3e17643805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6",
};

export const USDollar: Asset = {
    name: "xUSDC",
    ticker: "xUSDC",
    symbol: <FidenaroImageIcon imageSrc="/images/LogoXUSDC.png" altText="xUSDC Logo" />,
    address: "resource_tdx_2_1tkr36auhr7jpn07yvktk3u6s5stcm9vrdgf0xhdym9gv096v4q7thf",
    price_key: "5c2102805d871d77971fa419bfc4659768f350a4178d95836a12f35da4d950c7974c805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6",
};

export const Hug: Asset = {
    name: "Hug",
    ticker: "HUG",
    symbol: <FidenaroImageIcon imageSrc="/images/LogoHug.png" altText="Hug Logo" />,
    address: "resource_tdx_2_1thtxzder4ncupdg47h6zktdnl6p4yqznttv6nuxvzcsntfhthz6m6m",
    price_key: "5c2102805dd6613723acf1c0b515f5f42b2db3fe835200535ad9a9f0cc162135a6eb805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6",
};

export const Unknown: Asset = {
    name: "Unknown",
    ticker: "Unknown",
    symbol: <FidenaroIcon icon={FaQuestion} color="pElement.200" />,
    address: "Unknown",
    price_key: "Unknown",
};

export function addressToAsset(address: string): Asset {
    switch (address) {
        case Radix.address:
            return Radix;
        case Bitcoin.address:
            return Bitcoin;
        case Ethereum.address:
            return Ethereum;
        case USDollar.address:
            return USDollar;
        case Hug.address:
            return Hug;
        default:
            return USDollar;
    }
};