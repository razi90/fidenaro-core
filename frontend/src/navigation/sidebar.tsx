import React from "react";
import { Text, Flex, Box } from "@chakra-ui/react";

function Sidebar() {
    return (
        <Box>

            <Flex
                direction="column"
                h="100vh"
                w="200px" // width of the sidebar
                borderRight="1px solid gray" // border color
                p="10px" // padding
                justifyContent="start"
                alignItems="start"
            >
                <Text mb="10px">Item 1</Text>
                <Text mb="10px">Item 2</Text>
                <Text mb="10px">Item 3</Text>
                {/* Add more items as needed */}
            </Flex>
        </Box>
    );
}

export default Sidebar;
