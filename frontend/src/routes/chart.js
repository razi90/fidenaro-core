import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ChartComponent = ({ data }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!data) return;

        const width = 928;
        const height = 300;
        const marginTop = 20;
        const marginRight = 30;
        const marginBottom = 30;
        const marginLeft = 40;

        const x = d3.scaleUtc(d3.extent(data, d => d.Date), [marginLeft, width - marginRight]);
        const y = d3.scaleLinear([0, d3.max(data, d => d.Close)], [height - marginBottom, marginTop]);

        const line = d3.line()
            .x(d => x(d.Date))
            .y(d => y(d.Close));

        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto; height: intrinsic; font: 10px sans-serif;")
            .style("-webkit-tap-highlight-color", "transparent")
            .style("overflow", "visible")
            .on("pointerenter pointermove", pointermoved)
            .on("pointerleave", pointerleft)
            .on("touchstart", event => event.preventDefault());

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).ticks(height / 40))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("text")
                .attr("x", -marginLeft)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text("↑ Daily Close ($)"));

        svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line(data));

        const tooltip = svg.append("g");

        const bisect = d3.bisector(d => d.Date).center;

        function pointermoved(event) {
            const i = bisect(data, x.invert(d3.pointer(event)[0]));
            tooltip.style("display", null);
            tooltip.attr("transform", `translate(${x(data[i].Date)},${y(data[i].Close)})`);

            const path = tooltip.selectAll("path")
                .data([,])
                .join("path")
                .attr("fill", "white")
                .attr("stroke", "black");

            const text = tooltip.selectAll("text")
                .data([,])
                .join("text")
                .call(text => text
                    .selectAll("tspan")
                    .data([formatDate(data[i].Date), formatValue(data[i].Close)])
                    .join("tspan")
                    .attr("x", 0)
                    .attr("y", (_, i) => `${i * 1.1}em`)
                    .attr("font-weight", (_, i) => i ? null : "bold")
                    .text(d => d));

            size(text, path);
        }

        function pointerleft() {
            tooltip.style("display", "none");
        }

        function formatValue(value) {
            return value.toLocaleString("en", {
                style: "currency",
                currency: "USD"
            });
        }

        function formatDate(date) {
            return date.toLocaleString("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC"
            });
        }

        function size(text, path) {
            const { x, y, width: w, height: h } = text.node().getBBox();
            text.attr("transform", `translate(${-w / 2},${15 - y})`);
            path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
        }

        chartRef.current.appendChild(svg.node());

        return () => {
            chartRef.current.innerHTML = '';
        };
    }, [data]);

    return <div ref={chartRef}></div>;
};

export default ChartComponent;
