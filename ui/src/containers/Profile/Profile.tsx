import React from 'react';
import {
    Box,
    Center,
    VStack,
    Flex,
    Avatar,
    WrapItem,
    Text,
} from "@chakra-ui/react";
import { routePageBoxStyle } from '../../libs/styles/RoutePageBox';
import { useQuery } from '@tanstack/react-query';
import { fetchUserInfo, fetchUserInfoById } from '../../libs/user/UserDataService';
import { User } from '../../libs/entities/User';
import { FaDiscord, FaTelegram, FaTwitter } from 'react-icons/fa';
import { fetchVaultList } from '../../libs/vault/VaultDataService';
import ProfileEditButton from '../../components/Button/ProfileEditButton/ProfileEditButton';
import { PrimerCard } from '../../components/Card/PrimerCard';
import { ValueCard } from '../../components/Card/ValueCard';
import { DescriptionCard } from '../../components/Card/DescriptionCard';
import { SocialButton } from '../../components/Button/SocialButton/SocialButton';
import { ProfileStatsTable } from '../../components/Table/ProfileStatsTable';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { fetchConnectedWallet } from '../../libs/wallet/WalletDataService';
import { useParams } from 'react-router-dom';
import { convertToXRDString } from '../../libs/etc/StringOperations';
import { LayoutMode } from '../../Layout';
import { fetchTradeHistory } from '../../libs/transaction/TransactionDataService';

interface ProfileProps {
    layoutMode: LayoutMode;
}

// Component for Profile Info (Avatar, Social Links)
const ProfileInfo: React.FC<{ profile: User | undefined }> = ({ profile }) => (
    <VStack pt={4} alignItems="center">
        <WrapItem>
            <Avatar size="2xl" name={profile?.name} src={profile?.avatar !== '' ? profile?.avatar : ''} />{' '}
        </WrapItem>
        <Flex justifyContent="center">
            {profile?.twitter && (
                <Box mx={2}>
                    <SocialButton label={'Twitter'} href={`https://www.twitter.com/${profile?.twitter}`}>
                        <FaTwitter />
                    </SocialButton>
                </Box>
            )}
            {profile?.telegram && (
                <Box mx={2}>
                    <SocialButton label={'Telegram'} href={`https://t.me/@${profile?.telegram}`}>
                        <FaTelegram />
                    </SocialButton>
                </Box>
            )}
            {profile?.discord && (
                <Box mx={2}>
                    <SocialButton label={'Discord'} href={`https://discord.gg/${profile?.discord}`}>
                        <FaDiscord />
                    </SocialButton>
                </Box>
            )}
        </Flex>
    </VStack>
);

// Component for Profile Description and Value Cards
const ProfileDetails: React.FC<{ profile: User | undefined; totalFollowers: number | undefined; totalEquity: number | undefined; isLoading: boolean }> = ({ profile, totalFollowers, totalEquity, isLoading }) => (
    <>
        <DescriptionCard title="Description" isLoading={isLoading}>
            {profile?.bio}
        </DescriptionCard>
        <Flex justifyContent="space-around">
            <ValueCard value={totalFollowers?.toString() ?? ''} description={"Follower"} isLoading={isLoading} />
            <ValueCard value={convertToXRDString(totalEquity)} description={"TVL"} isLoading={isLoading} />
        </Flex>
    </>
);

const Profile: React.FC<ProfileProps> = ({ layoutMode }) => {
    const { id } = useParams();

    const { data: vaults, isLoading, isError } = useQuery({ queryKey: ['vault_list'], queryFn: fetchVaultList });
    const { data: user, isLoading: isUserFetchLoading, isError: isUserFetchError } = useQuery<User>({ queryKey: ['user_info'], queryFn: fetchUserInfo });
    const { data: profile, isLoading: isProfileLoading, isError: isProfileFetchError } = useQuery<User>({ queryKey: ['ext_user_info'], queryFn: () => fetchUserInfoById(`#${id}#` ?? "") });
    const { data: wallet, isLoading: isWalletFetchLoading, isError: isWalletFetchError } = useQuery<WalletDataState>({ queryKey: ['wallet_data'], queryFn: fetchConnectedWallet });

    const managedVaults = vaults?.filter((vault) => vault.manager.id === profile?.id);
    const investedVaults = vaults?.filter((vault) => vault.followers.includes(profile?.account ?? ''));
    const totalFollowers = managedVaults?.reduce((total, vault) => total + vault.followers.length, 0);
    const totalEquity = managedVaults?.reduce((total, vault) => total + vault.tvlInXrd, 0);
    const managerPnL = managedVaults?.reduce((total, vault) => total + vault.calculatePnL(), 0);
    const investorPnL = investedVaults?.reduce((total, vault) => total + vault.calculatePnL(), 0);

    const { data: tradeHistory, isLoading: isTradeHistoryFetchLoading, isError: isTradeHistoryFetchError } = useQuery({
        queryKey: ['trade_history', profile?.account],
        queryFn: () => fetchTradeHistory({
            entityIds: [
                ...(profile?.account ? [profile.account] : [])
            ]
        }),
        enabled: !!profile?.account,  // Query only runs when profile?.account is available
    });

    const totalTrades = tradeHistory?.length;

    if (isError) {
        return <Box sx={routePageBoxStyle(layoutMode)}>Error loading data</Box>;
    }

    let managerPnLRankings = new Map();

    vaults?.forEach((vault) => {
        let managerId = vault.manager.id;
        if (!managerPnLRankings.has(managerId)) {
            managerPnLRankings.set(managerId, 0);
        }
        managerPnLRankings.set(managerId, managerPnLRankings.get(managerId) + vault.calculatePnL());
    });

    let sortedManagersByRank = Array.from(managerPnLRankings).sort((a, b) => b[1] - a[1]);
    let managerRank = sortedManagersByRank.findIndex((manager) => manager[0] === profile?.id) + 1;

    const isLoadingProfile = isLoading || isProfileLoading;

    return (
        <>
            <Box sx={routePageBoxStyle(layoutMode)} p="8">
                <Center>
                    <Box maxW="6xl" minH="xl" width="100vw">
                        {layoutMode === LayoutMode.DesktopExpanded ? (
                            <Flex p={4}>
                                <PrimerCard cardTitle={profile?.name} cardWidth="50%" cardHeight="100%" isLoading={isLoadingProfile}>
                                    <Flex flex="1" p={1}>
                                        <ProfileInfo profile={profile} />
                                        <Box flex="1">
                                            <ProfileDetails profile={profile} totalFollowers={totalFollowers} totalEquity={totalEquity} isLoading={isLoadingProfile} />
                                            {user?.id === profile?.id && (
                                                <Flex justifyContent="flex-end" w="100%" pr={3} mt={4}>
                                                    <ProfileEditButton user={user} isLoading={isLoadingProfile || isUserFetchLoading} />
                                                </Flex>
                                            )}
                                        </Box>
                                    </Flex>
                                </PrimerCard>
                                <PrimerCard cardTitle="Stats" cardWidth="50%" cardHeight="auto" isLoading={isLoading}>
                                    <Box p="4">
                                        <VStack mt={8}>
                                            <ProfileStatsTable
                                                rank={managerRank}
                                                totalEquity={totalEquity}
                                                managerPnL={managerPnL}
                                                investorPnL={investorPnL}
                                                totalTrades={totalTrades}
                                                isLoading={isLoadingProfile}
                                            />
                                        </VStack>
                                    </Box>
                                </PrimerCard>
                            </Flex>
                        ) : (
                            <VStack spacing={4} p={4}>
                                <PrimerCard cardTitle={profile?.name} cardWidth="100%" cardHeight="auto" isLoading={isLoadingProfile}>
                                    <VStack align="stretch">
                                        <ProfileInfo profile={profile} />
                                        <ProfileDetails profile={profile} totalFollowers={totalFollowers} totalEquity={totalEquity} isLoading={isLoadingProfile} />
                                        {user?.id === profile?.id && (
                                            <Flex justifyContent="flex-end" w="100%" pr={3} mt={4}>
                                                <ProfileEditButton user={user} isLoading={isLoadingProfile || isUserFetchLoading} />
                                            </Flex>
                                        )}
                                    </VStack>
                                </PrimerCard>
                                <PrimerCard cardTitle="Stats" cardWidth="100%" cardHeight="auto" isLoading={isLoading}>
                                    <Box p="4">
                                        <VStack>
                                            <ProfileStatsTable
                                                rank={managerRank}
                                                totalEquity={totalEquity}
                                                managerPnL={managerPnL}
                                                investorPnL={investorPnL}
                                                totalTrades={totalTrades}
                                                isLoading={isLoadingProfile}
                                            />
                                        </VStack>
                                    </Box>
                                </PrimerCard>
                            </VStack>
                        )}
                    </Box>
                </Center>
            </Box>
        </>
    );
};

export default Profile;
