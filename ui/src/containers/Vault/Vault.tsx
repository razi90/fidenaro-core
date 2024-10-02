import React from 'react';
import {
    Box,
    Center,
    Flex,
    VStack,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from "notistack";
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
import { LayoutMode } from '../../Layout';

interface VaultProps {
    layoutMode: LayoutMode;
}

const Vault: React.FC<VaultProps> = ({ layoutMode }) => {
    const { id } = useParams();
    const { enqueueSnackbar } = useSnackbar();

    const { data: vault, isLoading: isVaultFetchLoading, isError, refetch } = useQuery({
        queryKey: ['vault'],
        queryFn: () => getVaultDataById(id!),
    });

    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });

    const { data: tradeHistory, isLoading: isTradeHistoryFetchLoading, isError: isTradeHistoryFetchError } = useQuery({
        queryKey: ['trade_history'],
        queryFn: () => fetchTradeHistory(
            {
                entityIds: [id!]
            }
        ),
    });

    let userShareTokenAmount = vault?.shareTokenAddress && user?.assets.has(vault?.shareTokenAddress) ? user.assets.get(vault?.shareTokenAddress) : 0;
    let userShareValue = vault?.pricePerShare ? vault.pricePerShare * userShareTokenAmount! : 0;
    let userTransactions = [...(vault?.withdrawals || []), ...(vault?.deposits || [])]
        .sort((a, b) => b.unixTimestamp - a.unixTimestamp)
        .filter(transaction => transaction.userId === user?.id);

    const isMobileLayout = layoutMode === LayoutMode.Mobile;

    const renderVaultCard = () => (
        <PrimerCard cardTitle="Vault" cardWidth={isMobileLayout ? "100%" : "50%"} cardHeight="auto" isLoading={isVaultFetchLoading}>
            <Flex direction={isMobileLayout ? "column" : "row"} w="100%">
                <DescriptionCard title={"Vault Name"} isLoading={isVaultFetchLoading}>
                    {vault?.name}
                </DescriptionCard>
                <Box w={isMobileLayout ? "100%" : "60%"}>
                    <ManagerCard name={vault?.manager.name} imageLink={vault?.manager.avatar} profileID={vault?.manager.id} isLoading={isVaultFetchLoading} />
                </Box>
            </Flex>
            <DescriptionCard title="Description" isLoading={isVaultFetchLoading}>
                {vault?.description}
            </DescriptionCard>

            <Flex direction={isMobileLayout ? "column" : "row"} w="100%">
                <ValueCard value={vault?.activeDays} description={"Active Days"} isLoading={isVaultFetchLoading} />
                <ValueCard value={vault?.followers.length} description={"Follower"} isLoading={isVaultFetchLoading} />
                {user?.id === vault?.manager.id && (
                    <ValueCard value={convertToXRDString(vault?.calculateTraderFeeInXrd())} description={"Earned Fee"} isLoading={isVaultFetchLoading} />
                )}
            </Flex>

            <Flex justifyContent={isMobileLayout ? "center" : "flex-end"} w="100%" mt={6} px={2}>
                {user?.id === vault?.manager.id && (
                    <>
                        <CollectTraderFeeButton vault={vault} user={user} isConnected={false} />
                        <Box m={1}></Box>
                        <TradeButton vault={vault} isConnected={false} onComplete={refetch} />
                    </>
                )}
                <Box m={1}></Box>
                <DepositButton vault={vault} isConnected={false} onDepositComplete={refetch} />
                <Box m={1}></Box>
                <WithdrawButton vault={vault} isConnected={false} onWithdrawComplete={refetch} />
            </Flex>
        </PrimerCard>
    );

    const renderStatsCard = () => (
        <PrimerCard cardTitle="Stats" cardWidth={isMobileLayout ? "100%" : "50%"} cardHeight="auto" isLoading={isVaultFetchLoading}>
            <Flex direction={isMobileLayout ? "column" : "row"} w="100%">
                <StatCard title="Vault ROI" value={convertToPercent(vault?.roi)} isLoading={isVaultFetchLoading} />
                <ValueCard value={convertToXRDString(vault?.tvlInXrd)} description={"TVL"} isLoading={isVaultFetchLoading} />
            </Flex>
            <Flex direction={isMobileLayout ? "column" : "row"} w="100%">
                <ValueCard value={convertToXRDString(vault?.followerEquity)} description={"Follower TVL"} isLoading={isVaultFetchLoading} />
                <ValueCard value={convertToXRDString(vault?.managerEquity)} description={"Manager TVL"} isLoading={isVaultFetchLoading} />
            </Flex>

            {userShareTokenAmount !== 0 && (
                <Flex direction={isMobileLayout ? "column" : "row"} w="100%">
                    <ValueCard value={convertToXRDString(vault?.calculateUserPnL(user?.id, userShareValue))} description={"Your PnL"} isLoading={isVaultFetchLoading} />
                    <ValueCard value={convertToXRDString(userShareValue)} description={"Your Current TVL"} isLoading={isVaultFetchLoading} />
                </Flex>
            )}
        </PrimerCard>
    );

    return (
        <Box sx={routePageBoxStyle(layoutMode)}>
            <Center>
                <Box maxW="6xl" minH="xl" width="100vw">
                    {isMobileLayout ? (
                        <VStack spacing={4} p={4}>
                            {renderVaultCard()}
                            {renderStatsCard()}
                        </VStack>
                    ) : (
                        <Flex p={4} gap={4}>
                            {renderVaultCard()}
                            {renderStatsCard()}
                        </Flex>
                    )}

                    {(vault?.userAssetValues !== undefined && vault?.userAssetValues.size > 0) && (
                        <Box p={4}>
                            <VaultAssetTable title="Assets" data={vault?.userAssetValues} isLoading={isVaultFetchLoading} isMobileLayout={isMobileLayout} />
                        </Box>
                    )}

                    {tradeHistory !== undefined && tradeHistory.length > 0 && (
                        <Box p={4}>
                            <VaultHistoryTable title="Trade History" data={tradeHistory} isLoading={isVaultFetchLoading} isMobileLayout={isMobileLayout} />
                        </Box>
                    )}

                    {userTransactions.length > 0 && (
                        <Box p={4}>
                            <VaultFlowHistoryTable title="My Transaction History" data={userTransactions} isLoading={isVaultFetchLoading} />
                        </Box>
                    )}
                </Box>
            </Center>
        </Box>
    );
}

export default Vault;
