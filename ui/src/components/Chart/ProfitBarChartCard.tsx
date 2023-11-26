import { Box, Card, SkeletonText, Text, Heading } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import { CardTitle } from '../Card/CardTitle';

interface ProfitBarChartCardProps {
    cardTitle: string;
    chartType: "line" | "area" | "bar" | "pie" | "donut" | "radialBar" | "scatter" | "bubble" | "heatmap" | "candlestick" | "boxPlot" | "radar" | "polarArea" | "rangeBar" | "rangeArea" | "treemap" | undefined;
    chartHeight: string;
    chartWidth: string;
    cardHeight: string;
    cardWidth: string;
    chartSeries: any; // ApexAxisChartSeries | ApexNonAxisChartSeries | undefined;//{ name: string, data: number[] }[] | { x: Date, y: [number, number, number, number] }[];
    isLoading: boolean;
}
export const ProfitBarChartCard: React.FC<ProfitBarChartCardProps> = ({ cardTitle, cardHeight, cardWidth, chartType, chartHeight, chartWidth, chartSeries, isLoading }) => {

    // Define the chart options and series data
    const chartOptions: ApexCharts.ApexOptions = {

        // Define the chart options and data
        chart: {
            type: "bar",
            height: chartHeight,

            zoom: {
                enabled: false, // disable zooming
            },
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                borderRadius: 5,
                horizontal: false,
                columnWidth: '98%',
                colors: {
                    ranges: [{
                        from: -100,
                        to: 0,
                        color: '#FF4560'
                    }, {
                        from: 0,
                        to: 100,
                        color: '#32CD32'
                    }]
                },
            },
        },

        dataLabels: {
            enabled: false,
        },
        xaxis: {
            type: 'datetime',
        },
        yaxis: {
            opposite: true,
            labels: {
                style: {
                    colors: ["#000"],
                },
                formatter: function (y) {
                    return y.toFixed(0) + "%";
                }
            }
        },

        fill: {
            type: "gradient",
            gradient: {
                type: "vertical",
                shadeIntensity: 0,
                opacityFrom: 1,
                opacityTo: 0.8,
                stops: [0, 100]
            },

        },
        grid: {
            show: true,
            position: 'back',
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            },
            row: {
                colors: undefined,
                opacity: 0.9
            },
            column: {
                colors: undefined,
                opacity: 0.9
            },
            padding: {
                left: 15,
                right: 20,
                top: 30,
                bottom: 30,
            },
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
                        <Box id="bar-chart">
                            <ReactApexChart
                                options={chartOptions}
                                series={chartSeries}
                                type="bar"
                                width={chartWidth}
                                height={chartHeight}
                            />
                        </Box>
                    </Card >
                )}
        </>




    );
};


