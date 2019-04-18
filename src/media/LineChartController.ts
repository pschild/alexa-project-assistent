import * as D3Node from 'd3-node';
import { ChartControllerAbstract } from './ChartControllerAbstract';

export interface ILineChartDataItem {
    key: string | number;
    value: string | number;
}

export class LineChartController extends ChartControllerAbstract {

    protected chartName: string = `line-chart-${new Date().getTime()}`;

    buildChart(data: ILineChartDataItem[]): D3Node {
        const styles = ``;
        const d3n = new D3Node({
            selector: this.selector,
            styles,
            container: this.container
        });
        const d3 = d3n.d3;

        const margin = { top: 20, right: 20, bottom: 60, left: 30 };
        const width = this.chartWidth - margin.left - margin.right;
        const height = this.chartHeight - margin.top - margin.bottom;

        const lineWidth = 1.5;
        const lineColor = 'steelblue';
        const lineColors = ['steelblue'];
        const isCurve = false;
        const tickSize = 5;
        const tickPadding = 5;

        const svg = d3n.createSVG(this.chartWidth, this.chartHeight)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const g = svg.append('g');

        // const { allKeys } = data;
        const allKeys = undefined;
        const xScale = d3.scaleTime()
            .domain(allKeys ? d3.extent(allKeys) : d3.extent(data, d => d.key))
            .range([0, width]);
        const yScale = d3.scaleLinear()
            .domain(allKeys ? [
                d3.min(data, d => d3.min(d, v => v.value)),
                d3.max(data, d => d3.max(d, v => v.value))
            ] : d3.extent(data, d => d.value))
            .range([height, 0]);
        const xAxis = d3.axisBottom(xScale)
            .ticks(d3.timeDay.every(1))
            .tickFormat(d3.timeFormat('%d.%m. %H:%M'));
        const yAxis = d3.axisLeft(yScale)
            .tickSize(tickSize)
            .tickPadding(tickPadding);

        const lineChart = d3.line()
            .x(d => xScale(d.key))
            .y(d => yScale(d.value));

        if (isCurve) {
            lineChart.curve(d3.curveBasis);
        }

        g.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        g.append('g').call(yAxis);

        g.append('g')
            .attr('fill', 'none')
            .attr('stroke-width', lineWidth)
            .selectAll('path')
            .data(allKeys ? data : [data])
            .enter().append('path')
            .attr('stroke', (d, i) => i < lineColors.length ? lineColors[i] : lineColor)
            .attr('d', lineChart);

        return d3n;
    }
}
