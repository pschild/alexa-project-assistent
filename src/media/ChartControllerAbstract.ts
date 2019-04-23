import AppState from '../app/state/AppState';
import { Inject } from 'typescript-ioc';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as D3Node from 'd3-node';
import * as svg2png from 'svg2png';
import { IPieChartDataItem } from './PieChartController';
import { IBarChartDataItem } from './BarChartController';
import { ILineChartDataItem } from './LineChartController';

export type IChartDataItem = IPieChartDataItem | IBarChartDataItem | ILineChartDataItem;

export abstract class ChartControllerAbstract {

    @Inject
    protected appState: AppState;

    private mediaFolderPath: string = path.join(process.cwd(), 'media-gen');
    protected abstract chartName: string = `generated-chart`;

    protected container: string = `<div id="chart"></div>`;
    protected selector: string = `#chart`;
    protected chartWidth: number = 833;
    protected chartHeight: number = 500;

    async generateChart(data: IChartDataItem[]): Promise<string> {
        const now = new Date().getTime();
        const htmlResult = this.buildChart(data);
        const svgBuffer = Buffer.from(htmlResult.svgString(), 'utf-8');
        return svg2png(svgBuffer)
            .then((buffer) => fse.writeFile(path.join(this.mediaFolderPath, `${this.chartName}-${now}.png`), buffer))
            .catch((e) => console.error('ERR:', e))
            .then(() => {
                return fse.exists(path.join(this.mediaFolderPath, `${this.chartName}-${now}.png`));
            })
            .then((exists) => {
                if (exists) {
                    return this.appState.getBaseUrl() + `${this.chartName}-${now}.png`;
                }
                throw new Error(`Could not find chart image`);
            });
    }

    abstract buildChart(data: IChartDataItem[]): D3Node;

}
