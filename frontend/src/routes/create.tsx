import { SetStateAction, useState } from "react";
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
    Text
} from "@chakra-ui/react";

const assets = [
    { name: "Bitcoin", image: "https://via.placeholder.com/50x50" },
    { name: "Ethereum", image: "https://via.placeholder.com/50x50" },
    { name: "Radix", image: "https://via.placeholder.com/50x50" },
];

export default function Create() {
    const [vaultName, setVaultName] = useState("");
    const [selectedAsset, setSelectedAsset] = useState<{ name: string; image: string; } | null>(null);
    const [performanceFee, setPerformanceFee] = useState(10);

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
                <FormControl mb={4}>
                    <FormLabel>Choose a name for your vault</FormLabel>
                    <Input type="text" value={vaultName} onChange={handleVaultNameChange} />
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Choose the asset to trade</FormLabel>
                    {assets.map((asset) => (
                        <Box
                            key={asset.name}
                            as="label"
                            display="flex"
                            alignItems="center"
                            mb={2}
                            cursor="pointer"
                        >
                            <input
                                type="radio"
                                name="asset"
                                value={asset.name}
                                checked={selectedAsset === asset}
                                onChange={() => handleAssetSelection(asset)}
                                style={{ display: "none" }}
                            />
                            <Box
                                borderWidth={1}
                                borderRadius="md"
                                borderColor="gray.200"
                                p={2}
                                mr={2}
                            >
                                <Image src={asset.image} alt={asset.name} boxSize="50px" />
                            </Box>
                            <span>{asset.name}</span>
                        </Box>
                    ))}
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
                <Button type="submit" colorScheme="blue"></Button>
            </form>
        </Box>
    );
}