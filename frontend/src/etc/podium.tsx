import { ReactNode } from 'react';
import {
    Box,
    Stack,
    Heading,
    Text,
    VStack,
    useColorModeValue,
    Button,
    Flex,
    Spacer,
    HStack,
    Image
} from '@chakra-ui/react';
import AvatarWithRipple from '../etc/avatar';

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

interface InfoBoxProps {
    name: string;
    count: number;
}

function InfoBox({ name, count }: InfoBoxProps) {
    return (
        <Box borderWidth="1px" p="4" borderRadius="md">
            <Flex alignItems="center">
                <Text fontWeight="bold" mr="2">
                    {name}
                </Text>
                <Spacer />
                <Text>{count}</Text>
            </Flex>
        </Box>
    );
}

export default function Podium() {
    return (

        <Box py={12} >
            <VStack>
                <Heading as="h2" fontSize="3xl">
                    Leaderboard
                </Heading>
            </VStack>
            <VStack>
                <HStack>
                    <Stack
                        direction={{ base: 'column', md: 'row' }}
                        justify="center"
                        spacing={{ base: 4, lg: 10 }}
                        py={10}
                    >
                        <VaultWrapper>
                            <VStack>
                                <AvatarWithRipple></AvatarWithRipple>
                                <Box py={4} px={12}>
                                    <Text fontWeight="00" fontSize="2xl">
                                        Market Wizard
                                    </Text>
                                </Box>
                            </VStack>

                            <VStack>
                                <Image
                                    objectFit='cover'
                                    maxW={{ base: '100%', sm: '100px' }}
                                    src='https://img.icons8.com/?size=512&id=35790&format=png'
                                    alt='Number 2'
                                />
                            </VStack>

                            <Stack align='stretch'>
                                <InfoBox name="TVL" count={100} />
                                <InfoBox name="Followers" count={1000} />
                            </Stack>

                            <VStack
                                bg={useColorModeValue('gray.50', 'gray.700')}
                                py={4}
                                borderBottomRadius={'xl'}
                                textAlign="center">
                                <Box w="80%" pt={7}>
                                    <Button w="max-content" colorScheme="green">
                                        Jump in
                                    </Button>
                                </Box>
                            </VStack>

                        </VaultWrapper>
                    </Stack>
                    <Stack
                        direction={{ base: 'column', md: 'row' }}
                        justify="center"
                        spacing={{ base: 4, lg: 10 }}
                        py={10}
                        pb={100}>

                        <VaultWrapper>

                            <VStack>
                                <AvatarWithRipple></AvatarWithRipple>
                                <Box py={4} px={12}>
                                    <Text fontWeight="00" fontSize="2xl">
                                        Market Wizard
                                    </Text>
                                </Box>
                            </VStack>

                            <VStack>
                                <Image
                                    objectFit='cover'
                                    maxW={{ base: '100%', sm: '100px' }}
                                    src='https://img.icons8.com/?size=512&id=RryJuxjeiVe5&format=png'
                                    alt='Number !'
                                />
                            </VStack>

                            <Stack align='stretch'>
                                <InfoBox name="TVL" count={100} />
                                <InfoBox name="Followers" count={1000} />
                            </Stack>

                            <VStack
                                bg={useColorModeValue('gray.50', 'gray.700')}
                                py={4}
                                borderBottomRadius={'xl'}
                                textAlign="center">
                                <Box w="80%" pt={7}>
                                    <Button w="max-content" colorScheme="green">
                                        Jump in
                                    </Button>
                                </Box>
                            </VStack>

                        </VaultWrapper>
                    </Stack>
                    <Stack
                        direction={{ base: 'column', md: 'row' }}
                        justify="center"
                        spacing={{ base: 4, lg: 10 }}
                        py={10}
                        pb={1}>

                        <VaultWrapper>

                            <VStack>
                                <AvatarWithRipple></AvatarWithRipple>
                                <Box py={4} px={12}>
                                    <Text fontWeight="00" fontSize="2xl">
                                        Market Wizard
                                    </Text>
                                </Box>
                            </VStack>

                            <VStack>
                                <Image
                                    objectFit='cover'
                                    maxW={{ base: '100%', sm: '100px' }}
                                    src='https://img.icons8.com/?size=512&id=35789&format=png'
                                    alt='Number 3'
                                />
                            </VStack>

                            <Stack align='stretch'>
                                <InfoBox name="TVL" count={100} />
                                <InfoBox name="Followers" count={1000} />
                            </Stack>

                            <VStack
                                bg={useColorModeValue('gray.50', 'gray.700')}
                                py={4}
                                borderBottomRadius={'xl'}
                                textAlign="center">
                                <Box w="80%" pt={7}>
                                    <Button w="max-content" colorScheme="green">
                                        Jump in
                                    </Button>
                                </Box>
                            </VStack>
                        </VaultWrapper>
                    </Stack>
                </HStack>
            </VStack>
        </Box>
    );
}