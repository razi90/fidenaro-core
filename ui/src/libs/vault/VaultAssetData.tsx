import {
    Text,
} from "@chakra-ui/react";
import { FaBitcoin, FaEthereum } from "react-icons/fa6";
import { FidenaroIcon } from "../../components/Icon/FidenaroIcon";

export const vaultAssetData = [
    {
        symbol: <FidenaroIcon icon={FaBitcoin} color="orange.400" />,
        coin: <Text as='b'>Stable Radix </Text>,
        coinAbbreviation: <Text as='samp' fontSize="sm">XUSD</Text>,
        percentage: <Text fontSize="xl">10%</Text>,
        date: <Text fontSize="sm">11/03/23</Text>
    },
    {
        symbol: <FidenaroIcon icon={FaEthereum} color="pElement.200" />,
        coin: <Text as='b'>Radix DLT </Text>,
        coinAbbreviation: <Text as='samp' fontSize="sm">XRD</Text>,
        percentage: <Text fontSize="xl">10%</Text>,
        date: <Text fontSize="sm">11/03/23</Text>
    },
    {
        symbol: <FidenaroIcon icon={FaBitcoin} color="orange.400" />,
        coin: <Text as='b'>Bitcoin </Text>,
        coinAbbreviation: <Text as='samp' fontSize="sm">BTC</Text>,
        percentage: <Text fontSize="xl">75%</Text>,
        date: <Text fontSize="sm">11/03/23</Text>
    },
    {
        symbol: <FidenaroIcon icon={FaEthereum} color="pElement.200" />,
        coin: <Text as='b'>Ethereum </Text>,
        coinAbbreviation: <Text as='samp' fontSize="sm">ETH</Text>,
        percentage: <Text fontSize="xl">5%</Text>,
        date: <Text fontSize="sm">11/03/23</Text>
    }
];