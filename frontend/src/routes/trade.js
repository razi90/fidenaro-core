import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Container, Grid, GridItem, FormControl, FormLabel, Input, Button } from '@chakra-ui/react';

const TradingInterface = (props) => {
    const [state, setState] = useState({
        bitcoinData: [],
    });

    useEffect(() => {
        async function fetchBitcoinData() {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7');
            const data = await response.json();
            setState({ ...state, bitcoinData: data.prices });
        }

        fetchBitcoinData();
    }, []);

    function handleSubmit(event) {
        event.preventDefault();
        // code to handle form submission
    }

    const data = {
        labels: state.bitcoinData.map(entry => new Date(entry[0]).toLocaleTimeString()),
        datasets: [
            {
                label: 'Bitcoin Price',
                data: state.bitcoinData.map(entry => entry[1]),
                fill: false,
                borderColor: '#00A3E0',
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Add this line to allow the chart to scale with the screen
        scales: {
            x: [
                {
                    type: 'time',
                    time: {
                        unit: 'day',
                    },
                },
            ],
            y: [
                {
                    type: 'linear',
                },
            ],
        },
    };

    return (
        <Container>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem colSpan={2}>
                    {state.bitcoinData.length > 0 && (
                        <div style={{ position: "relative", height: "80vh", width: "100%" }}>
                            <Line data={data} options={options} />
                        </div>
                    )}
                </GridItem>
                <GridItem>
                    <FormControl onSubmit={handleSubmit}>
                        <FormLabel>Amount</FormLabel>
                        <Input type="number" placeholder="Enter amount" />

                        <FormLabel>Price</FormLabel>
                        <Input type="number" placeholder="Enter price" />

                        <Button type="submit" colorScheme="blue" mt={4}>
                            Place Order
                        </Button>
                    </FormControl>
                </GridItem>
            </Grid>
        </Container>
    );
}

export default TradingInterface;
