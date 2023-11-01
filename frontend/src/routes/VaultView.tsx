import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Image, List, ListItem, Flex, Text, Grid, GridItem, Card, CardBody, Stack, Divider, CardFooter, ButtonGroup, Button, SimpleGrid, CardHeader } from '@chakra-ui/react';
import vaultsData from '../dummy_data/vaults.json';
import ChartComponent from './chart';
import InvestButton from '../etc/invest_button';
import { performInvestment } from '../etc/investment_utils';
import TradingHistory from '../etc/TradingHistory';

interface VaultData {
    id: string;
    vault: string;
    total: string;
    today: string;
    activeDays: string;
    follower: string;
    equity: string;
}

interface Trade {
    date: string;
    entry: string;
    close: string;
    direction: string;
    leverage: string;
    pnl: string;
    fee: string;
}

const generateDummyData = () => {
    const startDate = new Date(2023, 0, 1).getTime(); // Convert to milliseconds
    const endDate = new Date(2023, 11, 31).getTime(); // Convert to milliseconds
    const numberOfDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

    const data = [];
    let currentClose = 100; // Starting close value

    for (let i = 0; i <= numberOfDays; i++) {
        const currentDate = new Date(startDate + i * 24 * 60 * 60 * 1000); // Increment by one day in milliseconds

        // Calculate the new close value based on the previous day's value
        currentClose += Math.random() * 10 - 5; // Random value between -5 and +5
        currentClose = Math.max(0, currentClose); // Ensure the value is non-negative

        data.push({ Date: currentDate, Close: currentClose });
    }

    return data;
};

const generateDummyTradingHistory = (): Trade[] => {
    const tradingHistory: Trade[] = [];

    for (let i = 0; i < 10; i++) {
        const randomDate = new Date(
            new Date().getTime() - Math.floor(Math.random() * 10000000000)
        );

        const formattedDate =
            randomDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
            }) +
            ' ' +
            randomDate.toLocaleTimeString('en-US', {
                hour12: false, // Use 24-hour format
                hour: '2-digit',
                minute: '2-digit',
            });

        const randomEntry = parseFloat((Math.random() * 10000).toFixed(2));
        const randomClose = parseFloat((Math.random() * 10000).toFixed(2));
        const randomDirection = Math.random() < 0.5 ? 'Long' : 'Short';
        const isWinningTrade =
            (randomDirection === 'Long' && randomClose > randomEntry) ||
            (randomDirection === 'Short' && randomClose < randomEntry);
        const performanceFee = isWinningTrade ? (randomClose - randomEntry) * 0.1 : 0;
        const randomLeverage = `${Math.floor(Math.random() * 10) + 1}x`; // Random leverage
        const pnl =
            randomDirection === 'Long'
                ? ((randomClose - randomEntry) - performanceFee).toFixed(2)
                : ((randomEntry - randomClose) - performanceFee).toFixed(2);
        const fee = isWinningTrade ? (parseFloat(pnl) * 0.1).toFixed(2) : '0.00'; // Fee is 0 for losing trades

        tradingHistory.push({
            date: formattedDate,
            entry: randomEntry.toFixed(2),
            close: randomClose.toFixed(2),
            direction: randomDirection,
            leverage: randomLeverage,
            pnl,
            fee,
        });
    }

    return tradingHistory;
};

const VaultView: React.FC = () => {

    const dummyData = generateDummyData();
    const tradingHistory = generateDummyTradingHistory();

    const { id } = useParams<{ id: string }>();
    const [vaultData, setVaultData] = useState<VaultData | null>(null);

    useEffect(() => {
        // Find the vault data based on the ID
        const selectedVault = vaultsData.find((vault) => vault.id === id);

        if (selectedVault) {
            setVaultData(selectedVault);
        } else {
            // Handle the case when the vault is not found
            console.log(`Vault with ID ${id} not found.`);
        }
    }, [id]);


    if (!vaultData) {
        return <div>Loading...</div>;
    }

    return (
        <Box mt={4} textAlign="center">
            <Heading>{vaultData.vault}</Heading>

            <Box flex="1" mt={4} textAlign="center">
                <Flex align='center' justify='center'>
                    <Image
                        objectFit='cover'
                        maxW={{ base: '100%', sm: '300px' }}
                        src='https://i.redd.it/sw3owrwch6271.jpg'
                        alt='You are retarded.'
                    />
                    {/* <Heading size='md'>Performance</Heading> */}
                    <ChartComponent data={dummyData} ></ChartComponent>
                </Flex>
            </Box>

            <Box mt={4} textAlign="center">
                <Card
                    direction={{ base: 'column', sm: 'row' }}
                    overflow='hidden'
                    variant='outline'
                >


                    <Box flex="1">
                        <Stack align='center' justify='center' p={4}>
                            <CardBody>
                                <Heading size='md'>Strategy</Heading>
                                <Text py='2'>
                                    Up only. Buy high, sell low. This is the way.
                                </Text>
                                <Text py='2'>
                                    Trust me, bro.
                                </Text>
                                <Divider></Divider>
                                <InvestButton onInvest={(amount) => performInvestment(amount)} />
                            </CardBody>
                        </Stack>
                    </Box>
                </Card>
            </Box>
            <Box mt={4} textAlign="center">
                <Heading size='md'>Vault Stats</Heading>
                <Box mt={4} textAlign="center">
                    <Flex>
                        <Box flexBasis="25%" p={3}>
                            <Card>
                                <CardHeader>
                                    <Heading size='md'> Total</Heading>
                                </CardHeader>
                                <Divider></Divider>
                                <CardBody>
                                    <Text>{vaultData.total}</Text>
                                </CardBody>
                            </Card>
                        </Box>
                        <Box flexBasis="25%" p={3}>
                            <Card>
                                <CardHeader>
                                    <Heading size='md'> Today</Heading>
                                </CardHeader>
                                <Divider></Divider>
                                <CardBody>
                                    <Text>{vaultData.today}</Text>
                                </CardBody>
                            </Card>
                        </Box>
                        <Box flexBasis="25%" p={3}>
                            <Card>
                                <CardHeader>
                                    <Heading size='md'> Active days</Heading>
                                </CardHeader>
                                <Divider></Divider>
                                <CardBody>
                                    <Text>{vaultData.activeDays}</Text>
                                </CardBody>
                            </Card>
                        </Box>

                        <Box flexBasis="25%" p={3}>
                            <Card>
                                <CardHeader>
                                    <Heading size='md'> Follower</Heading>
                                </CardHeader>
                                <Divider></Divider>
                                <CardBody>
                                    <Text>{vaultData.follower}</Text>
                                </CardBody>
                            </Card>
                        </Box>
                        <Box flexBasis="25%" p={3}>
                            <Card>
                                <CardHeader>
                                    <Heading size='md'> Equity</Heading>
                                </CardHeader>
                                <Divider></Divider>
                                <CardBody>
                                    <Text>{vaultData.equity}</Text>
                                </CardBody>
                            </Card>
                        </Box>
                    </Flex>
                </Box>
            </Box>
            <TradingHistory trades={tradingHistory} />
        </Box >
    );
};

export default VaultView;
