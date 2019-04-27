import * as D3Node from 'd3-node';
import { ChartControllerAbstract } from './ChartControllerAbstract';

export interface IProgressBarChartDataItem {
    label: string | number;
    percent: string | number;
}

export class ProgressBarChartController extends ChartControllerAbstract {

    protected chartName: string = `progress-bar-chart`;
    protected chartWidth: number = 800;
    protected chartHeight: number = 100;

    private defaultBarColor: string = '#4682b4';
    private backgroundColor: string = '#ddd';

    setLineColor(color: string): ProgressBarChartController {
        this.defaultBarColor = color;
        return this;
    }

    buildChart(data: IProgressBarChartDataItem[]): D3Node {
        const styles = `
            text {font: 16px sans-serif;}
            .bar-label {font: 30px sans-serif; text-anchor: middle; fill: #000;}
            .background {fill: ${this.backgroundColor}}
        `;
        const d3n = new D3Node({
            selector: this.selector,
            styles,
            container: this.container
        });

        const margin = { top: 0, right: 0, bottom: 0, left: 0 };
        const width = this.chartWidth - margin.left - margin.right;
        const height = this.chartHeight - margin.top - margin.bottom;

        const svg = d3n.createSVG(this.chartWidth, this.chartHeight);
        svg.append('rect')
            .attr('class', 'background')
            .attr('width', '100%')
            .attr('height', '100%');

        const group = svg.selectAll('g.bar-group')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'bar-group');

        group.append('rect')
            .attr('width', d => (d.percent / 100) * width)
            .attr('height', height)
            .attr('fill', d => d.styles && d.styles.color ? d.styles.color : this.defaultBarColor);

        group.append('text')
            .attr('class', 'bar-label')
            .text(d => d.label)
            .attr('x', width / 2)
            .attr('y', height / 2 + 10);

        return d3n;
    }
}
