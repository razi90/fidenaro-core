import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import vaultsData from '../dummy_data/vaults.json';

interface PerformanceData {
    date: string;
    value: number;
}

interface Props {
    vaultId: string;
    containerHeight: number;
}

const LineGraphForVault: React.FC<Props> = ({ vaultId, containerHeight }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const selectedVault = vaultsData.find((vault) => vault.id === vaultId);

        if (selectedVault && svgRef.current) {
            const svg = d3.select(svgRef.current);
            const margin = { top: 20, right: 30, bottom: 30, left: 40 };
            const width = window.innerWidth;
            const height = containerHeight - margin.top - margin.bottom;

            const data = selectedVault.performanceData;

            const x = d3.scaleTime()
                .domain(d3.extent(data, (d) => new Date(d.date)) as [Date, Date])
                .range([margin.left, width - margin.right]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, (d) => d.value) || 0])
                .nice()
                .range([height - margin.bottom, margin.top]);

            const xAxis = d3.axisBottom(x);
            const yAxis = d3.axisLeft(y);

            const line = d3.line<PerformanceData>()
                .x((d) => x(new Date(d.date)))
                .y((d) => y(d.value))
                .curve(d3.curveMonotoneX);

            svg.selectAll("*").remove();

            svg.attr("width", width).attr("height", containerHeight);

            // Create dashed grid lines for y-axis
            svg.append("g")
                .attr("class", "grid")
                .attr("transform", `translate(${margin.left},0)`)
                .call(
                    d3.axisLeft(y)
                        .tickSize(-width)
                        .tickFormat(() => "")
                        .tickSizeOuter(0)
                )
                .selectAll("line")
                .attr("stroke-dasharray", "4,4");

            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(xAxis);

            svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", `translate(${margin.left},0)`)
                .call(yAxis)
                .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick line").clone()
                    .attr("x2", width - margin.left - margin.right)
                    .attr("stroke-opacity", 0.1));

            const color = data[data.length - 1].value > data[0].value ? "green" : "red";

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 2)
                .attr("d", line)
                .transition()
                .duration(1000)
                .attrTween("stroke-dasharray", function () {
                    const length = this.getTotalLength() as number;
                    return d3.interpolateString("0," + length, length + "," + length);
                });

            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", (d) => x(new Date(d.date)))
                .attr("cy", (d) => y(d.value))
                .attr("r", 4)
                .attr("fill", color)
                .style("opacity", 0)
                .transition()
                .delay(800)
                .duration(500)
                .style("opacity", 1);
        }
    }, [vaultId, containerHeight]);

    return <svg ref={svgRef}></svg>;
};

export default LineGraphForVault;
