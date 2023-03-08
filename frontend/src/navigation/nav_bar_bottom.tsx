import { ReactNode } from 'react';
import {
  Box,
  Flex,
  Link,
  useDisclosure,
  useColorModeValue,
  Stack,
  IconButton,
  HStack,

} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';

const Links = ['About', 'API', 'Contact', 'Help', 'Jobs', 'Bug Bounty', 'Brand', 'Terms of Service', 'Business'];

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    style={{ color: '#33FF9C' }}
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
    }}
    href={'#'}>
    {children}
  </Link>
);

export default function NavBarBottom() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />

          <HStack spacing={8} alignItems={'center'}>

            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </HStack>

          </HStack>
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