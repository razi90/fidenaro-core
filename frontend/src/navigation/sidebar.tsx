import { Flex, Box, VStack, Link, useColorModeValue, Stack, Image, Menu, MenuButton, MenuList, Button, MenuDivider, MenuGroup, MenuItem, Heading, Avatar, Icon } from "@chakra-ui/react";
import { BsCompass, BsPieChart, BsAward, BsQuestionCircle } from 'react-icons/bs';

const Links = [
    { label: 'Explore', icon: BsCompass },
    { label: 'Portfolio', icon: BsPieChart },
    { label: 'Leaderboard', icon: BsAward },
    { label: 'FAQ', icon: BsQuestionCircle },
];

const NavLink = ({ label, icon: IconComponent }: { label: string; icon: React.ElementType }) => (
    <Link
        px={2}
        py={1}
        rounded={'md'}
        _hover={{
            textDecoration: 'none',
            bg: useColorModeValue('gray.200', 'gray.700'),
        }}
        href={'/' + label.toLowerCase()}
    >
        <Flex alignItems="center">
            <Icon as={IconComponent} boxSize={6} mr={2} />
            {label}
        </Flex>
    </Link>
);

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
                <VStack spacing={2} alignItems="start">
                    <Menu>
                        <MenuButton as={Button} variant="ghost" colorScheme="purple" display="flex" alignItems="center">
                            <Flex alignItems="center">
                                <Avatar name='Ryan Florence' src='https://bit.ly/ryan-florence' size="sm" mr={2} />
                                Profile
                            </Flex>
                        </MenuButton>
                        <MenuList>
                            <MenuGroup title="Profile">
                                <MenuItem>My Account</MenuItem>
                                <MenuItem>Payments</MenuItem>
                            </MenuGroup>
                            <MenuDivider />
                            <MenuGroup title="Help">
                                <MenuItem>Docs</MenuItem>
                                <MenuItem>FAQ</MenuItem>
                            </MenuGroup>
                        </MenuList>
                    </Menu>
                    <Heading fontSize="sm" color="black.500">Trade</Heading>
                    <Box borderTop="1px solid gray" w="100%" />
                    <Stack as={'nav'} spacing={4}>
                        {Links.slice(0, 3).map(({ label, icon }) => (
                            <NavLink key={label} label={label} icon={icon} />
                        ))}
                    </Stack>
                    <Heading fontSize="sm" color="black.500">More</Heading>
                    <Box borderTop="1px solid gray" w="100%" />
                    <Stack as={'nav'} spacing={4}>
                        {Links.slice(3, 4).map(({ label, icon }) => (
                            <NavLink key={label} label={label} icon={icon} />
                        ))}
                    </Stack>
                </VStack>
                {/* Add more items as needed */}
            </Flex>
        </Box >
    );
}

export default Sidebar;
