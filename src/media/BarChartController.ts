import * as D3Node from 'd3-node';
import { ChartControllerAbstract } from './ChartControllerAbstract';

export interface IBarChartDataItem {
    key: string | number;
    value: string | number;
}

export class BarChartController extends ChartControllerAbstract {

    protected chartName: string = `bar-chart-${new Date().getTime()}`;

    buildChart(data: IBarChartDataItem[]): D3Node {
        const styles = `
            .bar { fill: steelblue; }
        `;
        const d3n = new D3Node({
            selector: this.selector,
            styles,
            container: this.container
        });
        const d3 = d3n.d3;

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = this.chartWidth - margin.left - margin.right;
        const height = this.chartHeight - margin.top - margin.bottom;

        const x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .range([height, 0]);

        const svg = d3n.createSVG(this.chartWidth, this.chartHeight)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        x.domain(data.map((d) => d.key));
        y.domain([0, d3.max(data, (d) => d.value)]);

        svg.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', (d) => x(d.key))
            .attr('width', x.bandwidth())
            .attr('y', (d) => y(d.value))
            .attr('height', (d) => height - y(d.value));

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append('g').call(d3.axisLeft(y));

        return d3n;
    }
}
