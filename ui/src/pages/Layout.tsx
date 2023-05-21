// general
import React from 'react';
import {
    Image,
    Box,
    CircularProgress,
    CircularProgressLabel,
    Center,
    Flex,
} from "@chakra-ui/react";

class Layout extends React.Component {

    render() {
        return <Box sx={{ bg: "back.900", h: "100vh" }} >
            <Flex
                w="100vw"
                h="100vh"
                alignItems="center"
                justifyContent="center"
            >
                <Center>
                    <CircularProgress isIndeterminate color='pElement.200' size='60vh' display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        thickness='2px'>
                        <CircularProgressLabel>
                            <Image
                                sx={{
                                    borderRadius: "full",
                                    boxSize: "40vh",
                                    padding: "5px",
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                }}
                                src="/images/LogoFidenaro.png"
                                alt="Fidenaro Logo"
                            />
                        </CircularProgressLabel>
                    </CircularProgress>
                </Center>
            </Flex>
        </Box>

    }
}
export default Layout;
