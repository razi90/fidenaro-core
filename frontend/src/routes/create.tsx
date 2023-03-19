import { ReactNode, SetStateAction, useState } from "react";
import {
    Box,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Image,
    Button,
    Stack,
    Text,
    useColorModeValue,
    HStack,
} from "@chakra-ui/react";

const assets = [
    { name: "Bitcoin", image: "https://altcoinsbox.com/wp-content/uploads/2022/12/bitcoin-logo-300x300.webp" },
    { name: "Ethereum", image: "https://altcoinsbox.com/wp-content/uploads/2023/01/ethereum-logo-300x300.webp" },
    { name: "Radix", image: "https://pbs.twimg.com/profile_images/1517539895761330177/yNSrmKk5_400x400.jpg" },
];

function VaultWrapper({ children }: { children: ReactNode }) {
    return (
        <Box
            mb={4}
            shadow="base"
            borderWidth="1px"
            alignSelf={{ base: 'center', lg: 'flex-start' }}
            borderColor={useColorModeValue('gray.200', 'gray.500')}
            borderRadius={'xl'}>
            {children}
        </Box>
    );
}

export default function Create() {
    const [vaultName, setVaultName] = useState("");
    const [selectedAsset, setSelectedAsset] = useState<{ name: string; image: string; } | null>(null);
    const [performanceFee, setPerformanceFee] = useState(30);

    const handleVaultNameChange = (event: { target: { value: SetStateAction<string>; }; }) => {
        console.log(event.target.value)
        setVaultName(event.target.value);
    };

    const handleAssetSelection = (asset: SetStateAction<{ name: string; image: string; } | null>) => {
        console.log(asset)
        setSelectedAsset(asset);
    };

    const handlePerformanceFeeChange = (value: SetStateAction<number>) => {
        console.log(value)
        setPerformanceFee(value);
    };

    const handleSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        console.log({
            vaultName,
            selectedAsset,
            performanceFee,
        });
    };

    return (
        <Box p={4}>
            <Box mb={8}>
                <Stack spacing={2} textAlign="left">
                    <Heading as="h1" fontSize="4xl">
                        Create
                    </Heading>
                    <Text fontSize="lg" color={'gray.500'}>
                        Set up your TradingVault and start earning on your performance
                    </Text>
                </Stack>
            </Box>
            <form onSubmit={handleSubmit}>
                <Stack
                    justify="center"
                    spacing={{ base: 4, lg: 10 }}
                    py={10}>
                    <VaultWrapper>
                        <FormControl mb={4}>
                            <FormLabel>Choose a name for your vault</FormLabel>
                            <Input type="text" value={vaultName} onChange={handleVaultNameChange} />
                        </FormControl>
                        <FormControl mb={4}>
                            <FormLabel>Choose the asset to trade</FormLabel>
                            <HStack>
                                {assets.map((asset) => (
                                    <Box
                                        key={asset.name}
                                        as="label"
                                        display="flex"
                                        alignItems="center"
                                        cursor="pointer"
                                        bg={selectedAsset === asset ? "blue.100" : "transparent"}
                                        borderRadius={selectedAsset === asset ? "full" : "md"} // add conditional styling here
                                        boxShadow={selectedAsset === asset ? "md" : "none"}
                                        transition="all 0.2s"
                                        _hover={{ boxShadow: "md" }}
                                    >

                                        <input
                                            type="radio"
                                            name="asset"
                                            value={asset.name}
                                            checked={selectedAsset === asset}
                                            onChange={() => handleAssetSelection(asset)}
                                            style={{ display: "none" }}
                                        />
                                        <Box p={2}>
                                            <Image
                                                src={asset.image}
                                                alt={asset.name}
                                                boxSize="50px"
                                                borderRadius="full" // add borderRadius property here
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </HStack>
                        </FormControl>
                        <FormControl mb={4}>
                            <FormLabel>Performance fee ({performanceFee}%)</FormLabel>
                            <Slider
                                defaultValue={performanceFee}
                                min={10}
                                max={50}
                                step={1}
                                onChange={handlePerformanceFeeChange}
                            >
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                            </Slider>
                        </FormControl>
                        <Box
                            display="flex"
                            justifyContent="center"
                        >
                            <Button type="submit" colorScheme="blue">Create</Button>
                        </Box>
                    </VaultWrapper>
                </Stack>
            </form>
        </Box >
    );
}