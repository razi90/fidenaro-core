import { Box, Card, SkeletonText } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import { CardTitle } from '../Card/CardTitle';

interface ChartProps {
    cardTitle: string;
    chartType: "line" | "area" | "bar" | "pie" | "donut" | "radialBar" | "scatter" | "bubble" | "heatmap" | "candlestick" | "boxPlot" | "radar" | "polarArea" | "rangeBar" | "rangeArea" | "treemap" | undefined;
    chartHeight: string;
    chartWidth: string;
    cardHeight: string;
    cardWidth: string;
    chartSeries: any; // ApexAxisChartSeries | ApexNonAxisChartSeries | undefined;//{ name: string, data: number[] }[] | { x: Date, y: [number, number, number, number] }[];
    isLoading: boolean;
}
export const ChartCard: React.FC<ChartProps> = ({ cardTitle, cardHeight, cardWidth, chartType, chartHeight, chartWidth, chartSeries, isLoading }) => {

    // Define the chart options and series data
    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: chartType,

            height: chartHeight,
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false, // disable zooming
            },
        },
        xaxis: {
            labels: {
                show: false,
            },
            axisTicks: {
                show: false
            },
        },
        tooltip: {
            enabled: true,

            x: {
                format: 'dd/MM/yy HH:mm'
            },
        },
        yaxis: {
            labels: {
                show: false,
            },
            crosshairs: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        dataLabels: {
            enabled: false,
        },
        grid: {
            show: false,

            padding: {
                left: -9,
                right: -9,
                bottom: -13,
            },
        },
        stroke: {

            width: 2, // Adjust this value to make the lines slimmer
            curve: 'smooth', //curve: 'straight',
            // colors: ["pElement.200"] // TODO import from BaseTheme.tsx
            colors: ['#6b5eff']
        },
        fill: {
            // colors: ["pElement.200"], // Change the area color below the line
            colors: ['#6b5eff'], // Change the area color below the line
        },
    };

    return (

        <>
            {
                isLoading ? (
                    <SkeletonText mt='2' noOfLines={2} spacing='4' skeletonHeight='2' />
                ) : (
                    <Card
                        w={cardWidth}
                        h={cardHeight}
                    >
                        <CardTitle cardTitle={cardTitle} />
                        <Box id="area-chart">
                            <ReactApexChart
                                options={chartOptions}
                                series={chartSeries}
                                type={chartType}
                                width={chartWidth}
                                height={chartHeight}
                            />
                        </Box>
                    </Card>
                )}
        </>



    );
};
