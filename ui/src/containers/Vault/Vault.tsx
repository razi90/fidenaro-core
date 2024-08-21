import React from 'react';
import {
    Box,
    Center,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';

import { Flex } from '@chakra-ui/react';
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
import { DepositButton } from '../../components/Button/DepositButton/DepositButton';
import { WithdrawButton } from '../../components/Button/WithdrawButton/WithdrawButton';
import { fetchVaultPerformanceSeries, fetchVaultProfitabilityData, fetchVaultFollowerChartData, fetchVaultTotalChartData, getVaultDataById } from '../../libs/vault/VaultDataService';
import { User } from '../../libs/entities/User';
import { fetchUserInfo } from '../../libs/user/UserDataService';
import { useParams } from 'react-router-dom';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { fetchConnectedWallet } from '../../libs/wallet/WalletDataService';
import { TradeButton } from '../../components/Button/TradeButton/TradeButton';
import { convertToDollarString, convertToPercent, convertToXRDString } from '../../libs/etc/StringOperations';
import { VaultFlowHistoryTable } from '../../components/Table/VaultFlowHistoryTable';
import { fetchTradeHistory } from '../../libs/transaction/TransactionDataService';


interface VaultProps {
    isMinimized: boolean;
}

const Vault: React.FC<VaultProps> = ({ isMinimized }) => {

    const { id } = useParams();

    const { enqueueSnackbar } = useSnackbar();

    const { data: vault, isLoading: isVaultFetchLoading, isError } = useQuery({
        queryKey: ['vault_list'],
        queryFn: () => getVaultDataById(id!),
    });
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });
    const { data: tradeHistory, isLoading: isTradeHistoryFetchLoading, isError: isTradeHistoryFetchError } = useQuery({
        queryKey: ['trade_history'],
        queryFn: () => fetchTradeHistory(id!),
    })
    const { data: candleChartData, isLoading: isCandleChartLoading, isError: isCandleChartFetchError } = useQuery({ queryKey: ['candle_chart'], queryFn: fetchVaultPerformanceSeries });
    const { data: followerChartData, isLoading: isFollowerChartLoading, isError: isFollowerChartFetchError } = useQuery({ queryKey: ['follower_chart'], queryFn: fetchVaultFollowerChartData });
    const { data: totalChartData, isLoading: isTotalChartLoading, isError: isTotalChartFetchError } = useQuery({ queryKey: ['total_chart'], queryFn: fetchVaultTotalChartData });
    const { data: profitabilityChartData, isLoading: isProfitabilityChartLoading, isError: isProfitabilityChartFetchError } = useQuery({ queryKey: ['profitability_chart'], queryFn: fetchVaultProfitabilityData });
    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    if (isError || isUserFetchError || isCandleChartFetchError || isProfitabilityChartFetchError || isTradeHistoryFetchError) {
        // Return error JSX if an error occurs during fetching
        enqueueSnackbar("Error loading user data", { variant: "error" });
    }

    let userShareTokenAmount = vault?.shareTokenAddress && user?.assets.has(vault?.shareTokenAddress) ? user.assets.get(vault?.shareTokenAddress) : 0;
    let userShareValue = vault?.pricePerShare ? vault.pricePerShare * userShareTokenAmount! : 0;
    let userTransactions = [...(vault?.withdrawals || []), ...(vault?.deposits || [])]
        .sort((a, b) => b.unixTimestamp - a.unixTimestamp)
        .filter(transaction => transaction.userId === user?.id);

    let userDepositSum = vault?.deposits.filter(transaction => transaction.userId === user?.id).reduce((accumulator, current) => {
        return accumulator + current.amount;
    }, 0);

    let userWithdrawalSum = vault?.withdrawals.filter(transaction => transaction.userId === user?.id).reduce((accumulator, current) => {
        return accumulator + current.amount;
    }, 0);

    return (

        <Box sx={routePageBoxStyle(isMinimized)}>
            <Center>
                <Box maxW="6xl" minH="xl" width="100vw" >
                    <Flex p={4} >
                        <PrimerCard cardTitle='Vault' cardWidth='50%' cardHeight='100%' isLoading={isVaultFetchLoading || isUserFetchLoading}>
                            <Flex >
                                <DescriptionCard title={"Vault Name"} isLoading={isVaultFetchLoading || isUserFetchLoading}>
                                    {vault?.name}
                                </DescriptionCard>
                                <Box w={"60%"}>
                                    <ManagerCard name={vault?.manager.name} imageLink={vault?.manager.avatar} profileID={vault?.manager.id} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                </Box>
                            </Flex>
                            <DescriptionCard title='Description' isLoading={isVaultFetchLoading || isUserFetchLoading}>
                                {vault?.description}
                            </DescriptionCard>

                            <Flex >
                                <ValueCard value={vault?.activeDays} description={"Active Days"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                <ValueCard value={vault?.followers.length} description={"Follower"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                            </Flex >
                            <Flex justifyContent='flex-end' w={"100%"} mt={6} px={2}  >
                                {
                                    user?.id === vault?.manager.id &&
                                    <TradeButton vault={vault} isConnected={wallet?.persona !== undefined} />
                                }
                                <Box m={1}></Box>
                                <DepositButton vault={vault} isConnected={(wallet?.persona) == undefined ? false : true} />
                                <Box m={1}></Box>
                                <WithdrawButton vault={vault} isConnected={(wallet?.persona) == undefined ? false : true} />
                            </Flex>

                        </PrimerCard >

                        <PrimerCard cardTitle='Stats' cardWidth='50%' cardHeight='auto' isLoading={isVaultFetchLoading || isUserFetchLoading}>
                            <Flex >
                                <StatCard title="Vault ROI" value={convertToPercent(vault?.calculateROI())} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                <ValueCard value={convertToDollarString(vault?.totalEquity)} description={"Equity"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                <ValueCard value={convertToDollarString(vault?.followerEquity)} description={"Equity Follower"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                <ValueCard value={convertToDollarString(vault?.managerEquity)} description={"Equity Manager"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                            </Flex>

                            {userShareTokenAmount !== 0 && (
                                <>
                                    <Flex >
                                        <StatCard title="Your ROI" value={convertToPercent(vault?.calculateUserROI(user?.id, userShareValue))} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                        <ValueCard value={convertToDollarString(vault?.calculateUserPnL(user?.id, userShareValue))} description={"Your PnL"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                        <ValueCard value={convertToDollarString(userShareValue)} description={"My Share Value"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                    </Flex>
                                    <Flex >
                                        <ValueCard value={convertToXRDString(userDepositSum)} description={"My Deposits"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                        <ValueCard value={convertToXRDString(userWithdrawalSum)} description={"My Withdrawals"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                    </Flex>
                                </>
                            )}

                        </PrimerCard>
                    </Flex >

                    <Flex>
                        <VaultAssetTable title='Assets' data={vault?.assets} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                    </Flex >

                    <Box p={4}>
                        <VaultHistoryTable title='Trade History' data={tradeHistory} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                    </Box>

                    <Box p={4}>
                        <VaultFlowHistoryTable title='My Transaction History' data={userTransactions} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                    </Box>
                </Box >
            </Center >
        </Box >
    )
    // }
    //}
}
export default Vault;
