import { VStack, Box, Stack, Heading, Text } from '@chakra-ui/react';

function Explore() {
    // Retrieve the JSON string from the localStorage with the key 'TradingVaults'
    const storedTradingVaults = localStorage.getItem('TradingVaults');

    // Parse the JSON string to get the original list of strings, or create an empty list if the storedTradingVaults is null or undefined.
    const storedTradingVaultList = storedTradingVaults ? JSON.parse(storedTradingVaults) : [];

    return (
        <Box p={4}>
            <Box mb={8}>
                <Stack spacing={2} textAlign="left">
                    <Heading as="h1" fontSize="4xl">
                        Explore
                    </Heading>
                    <Text fontSize="lg" color={'gray.500'}>
                        Follow the trader you want
                    </Text>
                </Stack>
            </Box>
            <VStack>
                {storedTradingVaultList.map((string) => (
                    <Box key={string} p={4} borderWidth="1px">
                        {string}
                    </Box>
                ))}
            </VStack>
        </Box>
    );
}

export default Explore;