import React from 'react';
import {
    Box,
    Center,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import { ChartCard } from '../../components/Chart/ChartCard';
import { ProfitBarChartCard } from '../../components/Chart/ProfitBarChartCard';
import { FidenaroIcon } from '../../components/Icon/FidenaroIcon'
import {
    Text,
} from "@chakra-ui/react";

import { Flex } from '@chakra-ui/react';
import { FaBitcoin, FaEthereum } from "react-icons/fa6";
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from "notistack";


// Local
import { PrimerCard } from '../../components/Card/PrimerCard';
import { ValueCard } from '../../components/Card/ValueCard';
import { StatCard } from '../../components/Card/StatCard';
import { VaultAssetTable } from '../../components/Table/VaultAssetTable';
import { VaultHistoryTable } from '../../components/Table/VaultHistoryTable';
import { DescriptionCard } from '../../components/Card/DescriptionCard';
import { ManagerCard } from '../../components/Card/ManagerCard';
import { FollowButton } from '../../components/Button/FollowButton/FollowButton';
import { fetchVaultAssetData, fetchVaultDummyChartData, fetchVaultHistoryData, fetchVaultList, fetchVaultPerformanceSeries, fetchVaultProfitabilityData } from '../../libs/vault/VaultDataService';
import { AppUser } from '../../libs/entities/User';
import { fetchUserInfo } from '../../libs/user/UserDataService';
import { FidenaroCircularProgress } from '../../components/Loading/FidenaroCircularProgress/FidenaroCircularProgress';
import { VaultHistory } from '../../libs/entities/Vault';


interface VaultProps {
    isMinimized: boolean;
}

const Vault: React.FC<VaultProps> = ({ isMinimized }) => {

    const { enqueueSnackbar } = useSnackbar();

    const { data: vaults, isLoading: isVaultFetchLoading, isError } = useQuery({ queryKey: ['vault_list'], queryFn: fetchVaultList });
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<AppUser>({ queryKey: ['user_info'], queryFn: fetchUserInfo });
    const { data: candleChartData, isLoading: isCandleChartLoading, isError: isCandleChartFetchError } = useQuery({ queryKey: ['candle_chart'], queryFn: fetchVaultPerformanceSeries });
    const { data: dummyChartData, isLoading: isDummyChartLoading, isError: isDummyChartFetchError } = useQuery({ queryKey: ['dummy_chart'], queryFn: fetchVaultDummyChartData });
    const { data: profitabilityChartData, isLoading: isProfitabilityChartLoading, isError: isProfitabilityChartFetchError } = useQuery({ queryKey: ['profitability_chart'], queryFn: fetchVaultProfitabilityData });
    const { data: vaultHistoryData, isLoading: isVaultHistoryLoading, isError: isVaultHistoryFetchError } = useQuery<VaultHistory[]>({ queryKey: ['vault_history'], queryFn: fetchVaultHistoryData });
    const { data: vaultAssetData, isLoading: isVaultAssetLoading, isError: isVaultAssetFetchError } = useQuery({ queryKey: ['vault_assets'], queryFn: fetchVaultAssetData });

    if (isError || isUserFetchError || isCandleChartFetchError || isDummyChartFetchError || isProfitabilityChartFetchError || isVaultHistoryFetchError || isVaultAssetFetchError) {
        // Return error JSX if an error occurs during fetching
        enqueueSnackbar("Error loading user data", { variant: "error" });
    }

    return (

        <Box sx={routePageBoxStyle(isMinimized)}>
            <Center>
                <Box maxW="6xl" minH="xl" width="100vw" >
                    <Flex p={4} >
                        <PrimerCard cardTitle='Vault' cardWidth='50%' cardHeight='100%'>
                            <Flex >
                                <DescriptionCard title='Vault Name' isLoading={isVaultFetchLoading || isUserFetchLoading}>
                                    The Bitcoin maxi
                                </DescriptionCard>
                                <Box w={"60%"}>
                                    <ManagerCard name='Segun Adebayo' imageLink='https://bit.ly/sage-adebayo' isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                </Box>
                            </Flex>
                            <DescriptionCard title='Description' isLoading={isVaultFetchLoading || isUserFetchLoading}>
                                View a summary of all your customers over the last month.
                                View a summary of all your customers over the last month.
                                View a summary of all your customers over the last month.
                                View a summary of all your customers over the last month.
                                View a summary of all your customers over the last month.
                                test test
                            </DescriptionCard>

                            <Flex >
                                <ValueCard value={"47"} description={"Active Days"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                <ValueCard value={"7"} description={"Follower"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                <Flex m={2} >
                                    <ChartCard
                                        cardTitle={""}
                                        cardWidth={"200"}
                                        cardHeight={"110"}
                                        chartType={"area"}
                                        chartHeight={"110"}
                                        chartWidth={"200"}
                                        chartSeries={dummyChartData}
                                        isLoading={isDummyChartLoading} />
                                </Flex>
                            </Flex>
                            <Flex justifyContent='flex-end' w={"100%"} mt={6} px={2}  >

                                <FollowButton vaultName='Horst' vaultFee={0.1} />

                            </Flex>
                        </PrimerCard>

                        <PrimerCard cardTitle='Stats' cardWidth='50%' cardHeight='auto'>
                            <Flex >
                                <StatCard title="Total" value="10 %" isLoading={isVaultFetchLoading || isUserFetchLoading} />

                                <Flex flex='1' m={2} >
                                    <ChartCard
                                        cardTitle={""}
                                        cardWidth={"100%"}
                                        cardHeight={"110"}
                                        chartType={"area"}
                                        chartHeight={"110"}
                                        chartWidth={"100%"}
                                        chartSeries={dummyChartData}
                                        isLoading={isDummyChartLoading} />

                                </Flex>
                            </Flex>
                            <Flex >
                                <StatCard title="Today" value="57 %" isLoading={isVaultFetchLoading || isUserFetchLoading} />

                                <Flex flex='1' m={2} >
                                    <ChartCard
                                        cardTitle={""}
                                        cardWidth={"100%"}
                                        cardHeight={"110"}
                                        chartType={"area"}
                                        chartHeight={"110"}
                                        chartWidth={"100%"}
                                        chartSeries={dummyChartData}
                                        isLoading={isDummyChartLoading} />
                                </Flex>
                            </Flex>
                            <Flex >
                                <ValueCard value={"100000 $"} description={"Equity"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                <ValueCard value={"4000 $"} description={"Equity Follower"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                <ValueCard value={"96000 $"} description={"Equity Manager"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                            </Flex>

                        </PrimerCard>
                    </Flex>
                    <Flex p={4}>
                        <ChartCard
                            cardTitle={"Performance"}
                            cardWidth={"100%"}
                            cardHeight={"300"}
                            chartType={"candlestick"}
                            chartHeight={"300"}
                            chartWidth={"98%"}
                            chartSeries={candleChartData}
                            isLoading={isCandleChartLoading} />
                    </Flex>

                    <Flex p={4}>
                        <ProfitBarChartCard
                            cardTitle={"Profitability"}
                            cardWidth={"50%"}
                            cardHeight={"400"}
                            chartType={"bar"}
                            chartHeight={"400"}
                            chartWidth={"100%"}
                            chartSeries={profitabilityChartData}
                            isLoading={isProfitabilityChartLoading}
                        />
                        <VaultAssetTable title='Assets' data={vaultAssetData} isLoading={isVaultFetchLoading || isUserFetchLoading || isVaultHistoryLoading} />
                    </Flex>

                    <Box p={4}>
                        <VaultHistoryTable title='History' data={vaultHistoryData} isLoading={isVaultFetchLoading || isUserFetchLoading || isVaultAssetLoading} />
                    </Box>
                </Box>
            </Center >
        </Box >
    )
}
export default Vault;
