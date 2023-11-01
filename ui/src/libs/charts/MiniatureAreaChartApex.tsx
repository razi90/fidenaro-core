import { Box } from '@chakra-ui/react';
import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface AreaChartProps {
  seriesData: number[];
}

const AreaChart: React.FC<AreaChartProps> = ({ seriesData }) => {
  const chart_type = "area"
  const chart_height = 100
  
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: chart_type,
      height: chart_height,
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      labels: {
        show: false,
      },
      axisTicks: {
        show:false
      },
    },
    yaxis: {
      labels: {
        show:false,
      },
      crosshairs: {
        show:false
      },
      axisTicks: {
        show:false
      },

    },
    tooltip: {
      enabled: false,
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: false,
    },
    stroke: {
      width: 1, // Adjust this value to make the lines slimmer
      curve: 'straight',
      // colors: ["pElement.200"] // TODO import from BaseTheme.tsx
      colors: ['#6b5eff']
    },
    fill: {
      // colors: ["pElement.200"], // Change the area color below the line
      colors: ['#6b5eff'], // Change the area color below the line
    },
  };

  const series = [
    {
      name: 'Series 1',
      data: seriesData,
    },
  ];

  return (
    <Box id="area-chart">
      <ReactApexChart options={options} series={series} type={chart_type} height={chart_height} />
    </Box>
  );
};

export default AreaChart;
