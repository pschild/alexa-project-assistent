import * as D3Node from 'd3-node';
import { ChartControllerAbstract } from './ChartControllerAbstract';

export interface IPieChartDataItem {
    label: string | number;
    value: string | number;
}

export class PieChartController extends ChartControllerAbstract {

    protected chartName: string = `pie-chart-${new Date().getTime()}`;
    protected chartWidth: number = 500;
    protected chartHeight: number = 500;

    private colorRange: string[] = undefined;

    setColors(colorRange: string[]): PieChartController {
        this.colorRange = colorRange;
        return this;
    }

    buildChart(data: IPieChartDataItem[]): D3Node {
        const styles = `
            .arc text {font: 30px sans-serif; text-anchor: middle;}
            .arc path {stroke: #fff;}
        `;
        const d3n = new D3Node({
            selector: this.selector,
            styles,
            container: this.container
        });
        const d3 = d3n.d3;

        const radius = this.chartWidth / 2;
        const color = d3.scaleOrdinal(this.colorRange ? this.colorRange : d3.schemeCategory10);

        const arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        const labelArc = d3.arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

        const pie = d3.pie()
            .sort(null)
            .value((d) => d.value);

        const svg = d3n.createSVG(this.chartWidth, this.chartHeight)
            .append('g')
            .attr('transform', `translate( ${radius} , ${radius} )`);

        const g = svg.selectAll('.arc')
            .data(pie(data))
            .enter().append('g')
            .attr('class', 'arc');

        g.append('path')
            .attr('d', arc)
            .style('fill', (d) => color(d.data.label));

        g.append('text')
            .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
            .attr('dy', '.35em')
            .text((d) => d.data.label);

        return d3n;
    }
}
