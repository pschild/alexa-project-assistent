import * as D3Node from 'd3-node';
import { ChartControllerAbstract } from './ChartControllerAbstract';

export interface ILineChartDataItem {
    name: string;
    values: ILineChartDataValueItem[];
    isStepped?: boolean;
}

export interface ILineChartDataValueItem {
    key: string | number | Date;
    value: string | number;
}

export class LineChartController extends ChartControllerAbstract {

    protected chartName: string = `line-chart`;

    private lineColor: string = '#ccc';
    private lineColors: string[] = ['#ccc'];

    setLineColor(lineColor: string): LineChartController {
        this.lineColor = lineColor;
        return this;
    }

    setLineColors(lineColors: string[]): LineChartController {
        this.lineColors = lineColors;
        return this;
    }

    buildChart(data: ILineChartDataItem[]): D3Node {
        const styles = `
            .tick > text {
                font-size: 16px;
            }
        `;
        const d3n = new D3Node({
            selector: this.selector,
            styles,
            container: this.container
        });
        const d3 = d3n.d3;

        const margin = { top: 20, right: 20, bottom: 60, left: 50 };
        const width = this.chartWidth - margin.left - margin.right;
        const height = this.chartHeight - margin.top - margin.bottom;

        const lineWidth = 2.5;
        const tickSize = 5;
        const tickPadding = 5;

        const minY = d3.min(data, d => d3.min(d.values, v => v.value));
        const maxY = d3.max(data, d => d3.max(d.values, v => v.value));

        const minX = d3.min(data, d => d3.min(d.values, v => v.key));
        const maxX = d3.max(data, d => d3.max(d.values, v => v.key));

        const svg = d3n.createSVG(this.chartWidth, this.chartHeight)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const g = svg.append('g');

        const xScale = d3.scaleTime()
            .domain([minX, maxX])
            .range([0, width]);
        const yScale = d3.scaleLinear()
            .domain([minY, maxY + 10])
            .range([height, 0]);
        const xAxis = d3.axisBottom(xScale)
            .ticks(d3.timeDay.every(1))
            .tickFormat(d3.timeFormat('%d.%m.'));
        const yAxis = d3.axisLeft(yScale)
            .tickSize(tickSize)
            .tickFormat(d => d + 'h')
            .tickPadding(tickPadding);

        let lineChart = d3.line()
            .x(d => xScale(d.key))
            .y(d => yScale(d.value));

        g.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        g.append('g').call(yAxis);

        g.append('g')
            .attr('fill', 'none')
            .attr('stroke-width', lineWidth)
            .selectAll('path')
            .data(data)
            .enter()
            .append('path')
            .attr('stroke', (d, i) => i < this.lineColors.length ? this.lineColors[i] : this.lineColor)
            .attr('d', d => {
                if (d.isStepped) {
                    lineChart = lineChart.curve(d3.curveStepAfter);
                } else {
                    lineChart = lineChart.curve(d3.curveLinear);
                }
                return lineChart(d.values);
            });

        return d3n;
    }
}
