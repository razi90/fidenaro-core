import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Center,
    HStack,
    VStack,
    Flex,
    Avatar,
    WrapItem,
    Text,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserInfo } from '../../libs/user/UserDataService';
import { AppUser } from '../../libs/entities/User';
import { FaDiscord, FaTelegram, FaTwitter } from 'react-icons/fa';
import { fetchVaultList } from '../../libs/vault/VaultDataService';
import ProfileEditButton from '../../components/Button/ProfileEditButton/ProfileEditButton';
import { PrimerCard } from '../../components/Card/PrimerCard';
import { ValueCard } from '../../components/Card/ValueCard';
import { DescriptionCard } from '../../components/Card/DescriptionCard';
import { SocialButton } from '../../components/Button/SocialButton/SocialButton';
import { ProfileStatsTable } from '../../components/Table/ProfileStatsTable';
import { ChartCard } from '../../components/Chart/ChartCard';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { fetchConnectedWallet } from '../../libs/wallet/WalletDataService';



interface ProfileProps {
    isMinimized: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isMinimized }) => {
    const seriesData = [
        {
            name: 'X',
            data: [
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
            ],
        }
    ];




    const { data: vaults, isLoading, isError } = useQuery({ queryKey: ['vault_list'], queryFn: fetchVaultList });
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<AppUser>({ queryKey: ['user_info'], queryFn: fetchUserInfo });
    // Get data to check if wallet is connected
    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });
    // Get Wallet Data and Personas
    //const queryClient = useQueryClient();
    //const walletData = queryClient.getQueryData<WalletDataState>(['wallet_data'])

    if (isError || isUserFetchError) {
        // Return error JSX if an error occurs during fetching
        return <Box sx={routePageBoxStyle(isMinimized)}>Error loading data</Box>;
    }



    const managedVaults = vaults?.filter((vault) => vault.manager === user?.account)


    const investedVaults = vaults?.filter((vault) => vault.followerList.includes(user?.account ?? ''))



    // Calculate the total followers from managed vaults
    const totalFollowers = managedVaults?.reduce((total, vault) => total + vault.followers, 0);

    // Calculate the total equity from managed vaults
    const totalEquity = managedVaults?.reduce((total, vault) => total + vault.equity, 0);

    // Calculate the total PnL as manager
    const managerPnL = managedVaults?.reduce((total, vault) => total + vault.pnl, 0);

    // Calculate the total PnL as investor. Should be based on shares one has in the vault but we assume 100% of shares for now

    const investorPnL = investedVaults?.reduce((total: any, vault: any) => total + vault.pnl, 0);



    // Total number of trades from all managed vaults
    const totalTrades = managedVaults?.reduce((total, vault) => total + vault.tradeHistory.length, 0);

    return (
        <>
            {
                wallet?.persona == undefined ? (
                    <Box sx={routePageBoxStyle(isMinimized)}>
                        <Center>
                            <Box maxW="6xl" minH="xl" width="100vw" >
                                <PrimerCard cardTitle={"Wallet not connected!"} cardWidth='100%' cardHeight='100%' isLoading={false}>
                                    <Text>Please connect your Radix DLT Wallet in order to connect/create a Fidenaro Profile.</Text>
                                </PrimerCard>
                            </Box >
                        </Center>
                    </Box >
                ) : (
                    <Box sx={routePageBoxStyle(isMinimized)} p={'8'}>
                        <Center>
                            <Box maxW="6xl" minH="xl" width="100vw" >
                                <Flex p={4} >
                                    <PrimerCard cardTitle={user?.account} cardWidth='50%' cardHeight='100%' isLoading={isLoading || isUserFetchLoading}>
                                        <Flex flex='1' p={1} >
                                            <VStack pt={4} mr={0} >
                                                <WrapItem>
                                                    <Avatar size='2xl' name={user?.account} src={user?.avatar} />{' '}
                                                </WrapItem>
                                                <Flex >
                                                    <Box flex='1' mx={2}>
                                                        <SocialButton label={'Twitter'} href={'#'}>
                                                            <FaTwitter />
                                                        </SocialButton>
                                                    </Box>
                                                    <Box flex='1' mx={2}>
                                                        <SocialButton label={'Telegram'} href={'#'}>
                                                            <FaTelegram />
                                                        </SocialButton>
                                                    </Box>
                                                    <Box flex='1' mx={2}>
                                                        <SocialButton label={'Discord'} href={'#'}>
                                                            <FaDiscord />
                                                        </SocialButton>
                                                    </Box>
                                                </Flex>
                                            </VStack>
                                            <Box flex='1'>
                                                <DescriptionCard title='Description' isLoading={isLoading || isUserFetchLoading}>
                                                    John Smith is a seasoned expert in the field of cryptocurrency trading,
                                                    specializing in the dynamic realm of Bitcoin.
                                                    With a wealth of experience and a keen understanding of the nuances
                                                    of the crypto market, John has established himself as a prominent figure in the world of digital assets.
                                                    Follow him on X
                                                </DescriptionCard>
                                                <Flex>
                                                    <ValueCard value={totalFollowers?.toString() ?? ''} description={"Follower"} isLoading={isLoading || isUserFetchLoading} />
                                                    <ValueCard value={totalEquity?.toString() + " $"} description={"Equity"} isLoading={isLoading || isUserFetchLoading} />
                                                </Flex>
                                                <Flex justifyContent='flex-end' w={"100%"} pr={3} mt={4} >

                                                    <ProfileEditButton onClick={function (): void {
                                                        throw new Error('Function not implemented.');
                                                    }} ></ProfileEditButton>

                                                </Flex>
                                            </Box>
                                        </Flex>


                                    </PrimerCard>

                                    <PrimerCard cardTitle='Stats' cardWidth='50%' cardHeight='auto' isLoading={isLoading}>
                                        <Box p={'4'}>

                                            <Flex m={2} >
                                                <ChartCard
                                                    cardTitle={""}
                                                    cardWidth={"100%"}
                                                    cardHeight={"120"}
                                                    chartType={"area"}
                                                    chartHeight={"120"}
                                                    chartWidth={"100%"}
                                                    chartSeries={seriesData}
                                                    isLoading={isLoading || isUserFetchLoading} />
                                            </Flex>

                                            <HStack mt={8}>
                                                <ProfileStatsTable
                                                    totalEquity={totalEquity}
                                                    managerPnL={managerPnL}
                                                    investorPnL={investorPnL}
                                                    totalTrades={totalTrades}
                                                    isLoading={isLoading || isUserFetchLoading}
                                                />
                                            </HStack>
                                        </Box>
                                    </PrimerCard>
                                </Flex>
                            </Box >
                        </Center>
                    </Box >
                )
            }
        </>
    )
}
export default Profile;
