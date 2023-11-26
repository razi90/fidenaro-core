import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Center,
    HStack,
    Heading,
    Image,
    Spacer,
    VStack,
    Text,
    Button,
    IconButton,
    Icon,
    Table,
    Tbody,
    Tr,
    Td,
    TableContainer,
    Square,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import { useQuery } from '@tanstack/react-query';
import { fetchUserInfo } from '../../libs/user/UserDataService';
import { AppUser } from '../../libs/entities/User';
import { FidenaroCircularProgress } from '../../components/Loading/FidenaroCircularProgress/FidenaroCircularProgress';
import { FaDiscord, FaTelegram, FaTwitter } from 'react-icons/fa';
import AreaChart from '../../libs/charts/MiniatureAreaChartApex';
import { fetchVaultList } from '../../libs/vault/VaultDataService';
import ProfileEditButton from '../../components/Button/ProfileEditButton/ProfileEditButton';

interface ProfileProps {
    isMinimized: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isMinimized }) => {

    const seriesData = [
        30,
        40,
        35,
        50,
        49,
        60,
        70,
        91,
        125,
        30,
        40,
        35,
        50,
        49,
        60,
        70,
        91,
        125
    ]

    const boxRef = useRef<HTMLDivElement | null>(null); // Specify the type of the ref
    const [boxWidth, setBoxWidth] = useState<number>(0); // State to store the box width

    const [first_render, setFirstRender] = useState<boolean>(true); // State to store the box width

    const { data: vaults, isLoading, isError } = useQuery({ queryKey: ['vault_list'], queryFn: fetchVaultList });
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<AppUser>({ queryKey: ['user_info'], queryFn: fetchUserInfo });

    // this effect is applied whenever the left navigation bar is extenden or collapsed
    useEffect(() => {
        if (boxRef.current) {
            if (isMinimized) {
                setBoxWidth(boxRef.current.clientWidth + 210);
            } else {
                setBoxWidth(boxRef.current.clientWidth - 210);
            }
        }
    }, [isMinimized]);

    // this effect is applied after the first creation of the DOM
    useEffect(() => {
        if (first_render && boxRef.current) {
            setBoxWidth(boxRef.current.clientWidth - 10);
            setFirstRender(false)
        }
    });

    if (isLoading || isUserFetchLoading) {
        return (
            <Box sx={routePageBoxStyle(isMinimized)}>
                <Center>
                    <FidenaroCircularProgress circleSize="30vh" circleBorderThickness="2px" circleImageSize="20vh" />
                </Center>
            </Box>
        );
    }

    if (isError || isUserFetchError) {
        // Return error JSX if an error occurs during fetching
        return <Box sx={routePageBoxStyle(isMinimized)}>Error loading data</Box>;
    }

    const managedVaults = vaults.filter((vault) => vault.manager === user.account)
    const investedVaults = vaults.filter((vault) => vault.followerList.includes(user.account))

    // Calculate the total followers from managed vaults
    const totalFollowers = managedVaults.reduce((total, vault) => total + vault.followers, 0);

    // Calculate the total equity from managed vaults
    const totalEquity = managedVaults.reduce((total, vault) => total + vault.equity, 0);

    // Calculate the total PnL as manager
    const managerPnL = managedVaults.reduce((total, vault) => total + vault.pnl, 0);

    // Calculate the total PnL as investor. Should be based on shares one has in the vault but we assume 100% of shares for now
    const investorPnL = investedVaults.reduce((total, vault) => total + vault.pnl, 0);

    // Total number of trades from all managed vaults
    const totalTrades = managedVaults.reduce((total, vault) => total + vault.tradeHistory.length, 0);

    return (
        <Box sx={routePageBoxStyle(isMinimized)} p={'8'}>
            <Box>
                <HStack justify="space-between">
                    <HStack width="100%">
                        <Image
                            borderRadius='full'
                            src={user.avatar}
                            boxSize='100px'
                            ml={'16'}
                        />
                        <Spacer></Spacer>
                        <VStack>
                            <Heading fontWeight={'light'} fontFamily={'body'} fontSize={'3xl'}>{user.account}</Heading>
                            <HStack spacing={2}>
                                <IconButton aria-label="Twitter"
                                    icon={<Icon as={FaTwitter} boxSize={5} />}
                                    variant="unstyled"
                                    _focus={{ outline: "none" }}
                                />
                                <IconButton aria-label="Twitter"
                                    icon={<Icon as={FaTelegram} boxSize={5} />}
                                    variant="unstyled"
                                    _focus={{ outline: "none" }}
                                />
                                <IconButton aria-label="Twitter"
                                    icon={<Icon as={FaDiscord} boxSize={5} />}
                                    variant="unstyled"
                                    _focus={{ outline: "none" }}
                                />
                            </HStack>
                            <Text>This is my profile description.</Text>
                            <HStack justify="space-between">
                                <Text>{totalFollowers} Followers</Text>
                                <Text>$ {totalEquity} Equity</Text>
                            </HStack>
                        </VStack>
                        <Spacer></Spacer>
                        <ProfileEditButton onClick={function (): void {
                            throw new Error('Function not implemented.');
                        }} ></ProfileEditButton>
                    </HStack>
                </HStack >
            </Box>
            <Box p={'10'}>
                <HStack>
                    <Square size={'275px'}>
                        <TableContainer>
                            <Table variant="simple">
                                <Tbody>
                                    <Tr>
                                        <Td><Text fontWeight="bold">Rank</Text></Td>
                                        <Td>10</Td>
                                    </Tr>
                                    <Tr>
                                        <Td><Text fontWeight="bold">Total Raised</Text></Td>
                                        <Td>$ {totalEquity}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td><Text fontWeight="bold">Manager PnL</Text></Td>
                                        <Td>$ {managerPnL}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td><Text fontWeight="bold">Investor PnL</Text></Td>
                                        <Td>$ {investorPnL}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td><Text fontWeight="bold">Total Trades</Text></Td>
                                        <Td>{totalTrades}</Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Square>
                    <Box flex='1' mr={10} ref={boxRef} >
                        <AreaChart seriesData={seriesData} width={boxWidth}></AreaChart>
                    </Box>
                </HStack>
            </Box>
        </Box >
    )
}
export default Profile;
