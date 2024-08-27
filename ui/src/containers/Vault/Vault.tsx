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
import { getVaultDataById } from '../../libs/vault/VaultDataService';
import { User } from '../../libs/entities/User';
import { fetchUserInfo } from '../../libs/user/UserDataService';
import { useParams } from 'react-router-dom';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { fetchConnectedWallet } from '../../libs/wallet/WalletDataService';
import { TradeButton } from '../../components/Button/TradeButton/TradeButton';
import { convertToPercent, convertToXRDString } from '../../libs/etc/StringOperations';
import { VaultFlowHistoryTable } from '../../components/Table/VaultFlowHistoryTable';
import { fetchTradeHistory } from '../../libs/transaction/TransactionDataService';
import { CollectTraderFeeButton } from '../../components/Button/CollectTraderFeeButton/CollectTraderFeeButton';


interface VaultProps {
    isMinimized: boolean;
}

const Vault: React.FC<VaultProps> = ({ isMinimized }) => {

    const { id } = useParams();

    const { enqueueSnackbar } = useSnackbar();

    const { data: vault, isLoading: isVaultFetchLoading, isError, refetch } = useQuery({
        queryKey: ['vault_list'],
        queryFn: () => getVaultDataById(id!),
    });

    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });

    const { data: tradeHistory, isLoading: isTradeHistoryFetchLoading, isError: isTradeHistoryFetchError } = useQuery({
        queryKey: ['trade_history'],
        queryFn: () => fetchTradeHistory(id!),
    })

    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    if (isError || isUserFetchError || isTradeHistoryFetchError) {
        // Return error JSX if an error occurs during fetching
        enqueueSnackbar("Error loading user data", { variant: "error" });
    }

    let userShareTokenAmount = vault?.shareTokenAddress && user?.assets.has(vault?.shareTokenAddress) ? user.assets.get(vault?.shareTokenAddress) : 0;
    let userShareValue = vault?.pricePerShare ? vault.pricePerShare * userShareTokenAmount! : 0;
    let userTransactions = [...(vault?.withdrawals || []), ...(vault?.deposits || [])]
        .sort((a, b) => b.unixTimestamp - a.unixTimestamp)
        .filter(transaction => transaction.userId === user?.id);

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
                                {
                                    user?.id === vault?.manager.id && <ValueCard value={convertToXRDString(vault?.calculateTraderFeeInXrd())} description={"Earned Fee"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                }
                            </Flex >
                            <Flex justifyContent='flex-end' w={"100%"} mt={6} px={2}  >
                                {
                                    user?.id === vault?.manager.id &&
                                    <>
                                        <CollectTraderFeeButton vault={vault} user={user} isConnected={wallet?.persona !== undefined} />
                                        <Box m={1}></Box>
                                        <TradeButton vault={vault} isConnected={wallet?.persona !== undefined} />
                                    </>
                                }
                                <Box m={1}></Box>
                                <DepositButton vault={vault} isConnected={(wallet?.persona) !== undefined} onDepositComplete={refetch} />
                                <Box m={1}></Box>
                                <WithdrawButton vault={vault} isConnected={(wallet?.persona) == undefined ? false : true} onWithdrawComplete={refetch} />
                            </Flex>

                        </PrimerCard >

                        <PrimerCard cardTitle='Stats' cardWidth='50%' cardHeight='auto' isLoading={isVaultFetchLoading || isUserFetchLoading}>
                            <Flex >
                                <StatCard title="Vault ROI" value={convertToPercent(vault?.roi)} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                <ValueCard value={convertToXRDString(vault?.tvlInXrd)} description={"TVL"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                            </Flex>
                            <Flex >
                                <ValueCard value={convertToXRDString(vault?.followerEquity)} description={"Follower TVL"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                <ValueCard value={convertToXRDString(vault?.managerEquity)} description={"Manager TVL"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                            </Flex>

                            {userShareTokenAmount !== 0 && (
                                <>
                                    <Flex >
                                        <ValueCard value={convertToXRDString(vault?.calculateUserPnL(user?.id, userShareValue))} description={"Your PnL"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                        <ValueCard value={convertToXRDString(userShareValue)} description={"Your Current TVL"} isLoading={isVaultFetchLoading || isUserFetchLoading} />
                                    </Flex>
                                </>
                            )}

                        </PrimerCard>
                    </Flex >

                    <Flex>
                        <VaultAssetTable title='Assets' data={vault?.userAssetValues} isLoading={isVaultFetchLoading || isUserFetchLoading} />
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
}
export default Vault;
