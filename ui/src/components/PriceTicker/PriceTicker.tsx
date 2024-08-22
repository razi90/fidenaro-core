import { useEffect, useState } from 'react';
import { Text, Box, Flex, Image, keyframes } from '@chakra-ui/react';
import { fetchPriceList } from '../../libs/price/PriceDataService';
import { Bitcoin, Ethereum, Hug, Radix } from '../../libs/entities/Asset';
import { convertToDollarString } from '../../libs/etc/StringOperations';

export default function PriceTicker() {
    const [prices, setPrices] = useState<{ [key: string]: number }>({});
    const [isHovered, setIsHovered] = useState(false);

    const marquee = keyframes`
        0% { transform: translateX(0%); }
        100% { transform: translateX(-100%); }
    `;

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                let priceList = await fetchPriceList();
                setPrices({
                    radix: priceList.get(Radix.address)?.priceInUSD ?? 0,
                    bitcoin: priceList.get(Bitcoin.address)?.priceInUSD ?? 0,
                    ethereum: priceList.get(Ethereum.address)?.priceInUSD ?? 0,
                    hug: priceList.get(Hug.address)?.priceInUSD ?? 0
                });
            } catch (error) {
                console.error('Error fetching crypto prices:', error);
            }
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 60000);
        return () => clearInterval(interval);
    }, []);

    const assets = [
        { name: "XRD", icon: "/images/LogoRadix.png", price: prices.radix, decimals: 3 },
        { name: "xwBTX", icon: "/images/LogoxwBTC.png", price: prices.bitcoin, decimals: 0 },
        { name: "xETH", icon: "/images/LogoxETH.png", price: prices.ethereum, decimals: 0 },
        { name: "HUG", icon: "/images/LogoHug.png", price: prices.hug, decimals: 6 }
    ];

    return (
        <Box
            overflow="hidden"
            whiteSpace="nowrap"
            width="50%"
            background="linear-gradient(to right, #6B5EFF, #BB6BD9)"
            padding="8px"
            borderRadius="md"
            position="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Flex
                as="div"
                animation={isHovered ? 'none' : `${marquee} 30s linear infinite`}
                alignItems="center"
                justifyContent="space-between"
            >
                {[...Array(5)].map((_, i) => (
                    <Flex key={i} alignItems="center">
                        {assets.map((asset, index) => (
                            <Box key={index} mx={4} display="flex" alignItems="center">
                                <Image src={asset.icon} alt={`${asset.name} Icon`} boxSize="20px" mr={2} />
                                <Text color="white">{`${asset.name}: ${convertToDollarString(asset.price, asset.decimals)}`}</Text>
                            </Box>
                        ))}
                    </Flex>
                ))}
            </Flex>
        </Box>
    );
}
