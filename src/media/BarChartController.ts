import * as D3Node from 'd3-node';
import { ChartControllerAbstract } from './ChartControllerAbstract';

export interface IBarChartDataItem {
    key: string | number;
    value: string | number;
    styles?: { color?: string; };
}

export class BarChartController extends ChartControllerAbstract {

    protected chartName: string = `bar-chart`;

    private defaultBarColor: string = '#4682b4';
    private yAxisUnit: string = 'h';

    setLineColor(color: string): BarChartController {
        this.defaultBarColor = color;
        return this;
    }

    setYAxisUnit(unit: string): BarChartController {
        this.yAxisUnit = unit;
        return this;
    }

    buildChart(data: IBarChartDataItem[]): D3Node {
        const styles = `
            text {font: 16px sans-serif;}
            .bar-label {font: 26px sans-serif; text-anchor: middle; fill: #000;}
        `;
        const d3n = new D3Node({
            selector: this.selector,
            styles,
            container: this.container
        });
        const d3 = d3n.d3;

        const margin = { top: 20, right: 20, bottom: 30, left: 60 };
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

        const bars = svg.selectAll('g.bar-group')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'bar-group')
            .attr('transform', d => `translate(${x(d.key)}, 0)`);

        bars.append('rect')
            .attr('width', x.bandwidth())
            .attr('height', (d) => height - y(d.value))
            .attr('y', (d) => y(d.value))
            .attr('fill', d => d.styles && d.styles.color ? d.styles.color : this.defaultBarColor);

        bars.append('text')
            .attr('class', 'bar-label')
            .text(d => `${(+d.value).toFixed(0)} ${this.yAxisUnit}`)
            .attr('x', x.bandwidth() / 2)
            .attr('y', (d) => {
                return y(d.value) > 10 ? y(d.value) - 10 : y(d.value) + 30;
            });

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append('g').call(d3.axisLeft(y).tickFormat(d => `${d} ${this.yAxisUnit}`));

        return d3n;
    }
}
