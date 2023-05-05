import React, { useState, useEffect } from 'react';
import { Chart, Series, ArgumentAxis, ValueAxis, Tooltip } from 'devextreme-react/chart';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';

const TradingInterface = () => {
    const [bitcoinData, setBitcoinData] = useState([]);

    useEffect(() => {
        async function fetchBitcoinData() {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7');
            const data = await response.json();
            setBitcoinData(data.prices);
        }

        fetchBitcoinData();
    }, []);

    return (
        <div>
            <Chart
                id="chart"
                dataSource={bitcoinData.map(([timestamp, price]) => ({
                    timestamp: new Date(timestamp),
                    price,
                }))}
            >
                <Series
                    type="line"
                    argumentField="timestamp"
                    valueField="price"
                    color="#00A3E0"
                />
                <ArgumentAxis valueType="datetime" />
                <ValueAxis />
                <Tooltip enabled={true} />
            </Chart>
        </div>
    );
};

export default TradingInterface;
