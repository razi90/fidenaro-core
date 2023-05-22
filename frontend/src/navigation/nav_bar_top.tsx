import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Link,
  useDisclosure,
  useColorModeValue,
  Stack,
  IconButton,
  HStack,
  Image,
} from '@chakra-ui/react';
import ConnectButton from "../etc/wallet_connect";

const Links = ['Fidenaro', 'Explore', 'Create', 'Dashboard', 'Docs', 'Trade'];

const NavLink = ({ children }: { children: string }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={children.toLowerCase()}>
    {children}
  </Link>
);

export default function TopNav() {
  const { isOpen } = useDisclosure();
  let navigate = useNavigate();
  const routeChange = () => {
    let path = `/`;
    navigate(path);
  }
  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <HStack spacing={8} alignItems={'center'}>
            <IconButton
              bg='green.300'
              aria-label='Search database'
              icon={<Image boxSize='50px' src="logo.jpg" />}
              onClick={routeChange}
            />
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </HStack>
          </HStack>
          <ConnectButton />
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}

      </Box>

    </>
  );
}