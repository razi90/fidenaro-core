import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  useColorModeValue,
  IconButton,
  HStack,
  Image,
  Text,
  Button,
  Spacer
} from '@chakra-ui/react';
import ConnectButton from "../etc/wallet_connect";

interface TopNavProps {
  // Add any props you expect this component to receive here
}

const TopNav: React.FC<TopNavProps> = (props) => {
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
              bg={useColorModeValue('gray.100', 'gray.900')}
              aria-label='Search database'
              icon={<Image boxSize='50px' src="https://fidenaro.com/images/LogoFidenaro.png" />}
              onClick={routeChange}
            />
            <Text fontSize="xl" fontWeight="bold">Fidenaro</Text>
          </HStack>
          <Spacer />
          <Button
            colorScheme="purple"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="50%"
            width="40px"
            height="40px"
            p={0}
            mr={8}
          >
            <Box
              as="span"
              width="60%"
              height="2px"
              bg="white"
              position="absolute"
            />
            <Box
              as="span"
              width="2px"
              height="60%"
              bg="white"
              position="absolute"
            />
          </Button>
          <ConnectButton />
        </Flex>
      </Box>
    </>
  );
}

export default TopNav;
