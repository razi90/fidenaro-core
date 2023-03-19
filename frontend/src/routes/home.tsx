import { ReactNode } from 'react';
import {
  Box,
  Stack,
  HStack,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Button,
  Flex,
  Spacer,
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

export default function Home() {
  return (

    <Box py={12}>
      <Box mb={8}>
        <Stack spacing={2} textAlign="left">
          <Heading as="h1" fontSize="4xl">
            Trade smarter with {globalThis.dAppName}
          </Heading>
          <Text fontSize="lg" color={'gray.500'}>
            Copy Trading on Radix
          </Text>
        </Stack>
      </Box>
      <VStack>
        <Heading as="h2" fontSize="3xl">
          Top Performers
        </Heading>
      </VStack>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        textAlign="center"
        justify="center"
        spacing={{ base: 4, lg: 10 }}
        py={10}>


        <VaultWrapper>

          <HStack>
            <AvatarWithRipple></AvatarWithRipple>
            <Box py={4} px={12}>
              <Text fontWeight="00" fontSize="2xl">
                Market Wizard
              </Text>
            </Box>
          </HStack>

          <Stack align='stretch'>
            <InfoBox name="TVL" count={100} />
            <InfoBox name="Followers" count={1000} />
          </Stack>

          <VStack
            bg={useColorModeValue('gray.50', 'gray.700')}
            py={4}
            borderBottomRadius={'xl'}>
            <Box w="80%" pt={7}>
              <Button w="max-content" colorScheme="green">
                Jump in
              </Button>
            </Box>
          </VStack>

        </VaultWrapper>
      </Stack>
    </Box>
  );
}