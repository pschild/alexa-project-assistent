import * as alexa from 'alexa-app';
import { buildDashboardDirective } from '../apl/datasources';

import { Inject } from 'typescript-ioc';
import { PieChartController, IPieChartDataItem } from '../media/PieChartController';
import { IBarChartDataItem, BarChartController } from '../media/BarChartController';
import { LineChartController, ILineChartDataItem, ILineChartDataValueItem } from '../media/LineChartController';
import { HandlerError } from './error/HandlerError';

export default class ProjectDashboardIntentHandler {

    @Inject
    private pieChartController: PieChartController;

    @Inject
    private barChartController: BarChartController;

    @Inject
    private lineChartController: LineChartController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const pieData: IPieChartDataItem[] = [
            { label: 'A', value: '20' },
            { label: 'B', value: '50' },
            { label: 'D', value: '10' }
        ];

        const barData: IBarChartDataItem[] = [
            { key: 'Bob', value: '33' },
            { key: 'Robin', value: '12' },
            { key: 'Anne', value: '41' },
            { key: 'Mark', value: '16' },
            { key: 'Joe', value: '59' }
        ];

        const seriesData: ILineChartDataValueItem[] = [
            { key: 1554983612551, value: 272 },
            { key: 1555317138000, value: 248 }, // -3d
            { key: 1555401302000, value: 244 }, // -4h
            { key: 1555433701000, value: 240 } // -4h
        ];

        const lineData: ILineChartDataItem[] = [{ name: 'test', values: seriesData }];

        const pieChartUrl = this.pieChartController.generateChart(pieData).catch((e) => {
            throw new HandlerError(`Ich konnte das Diagramm nicht finden.`);
        });
        const barChartUrl = this.barChartController.generateChart(barData).catch((e) => {
            throw new HandlerError(`Ich konnte das Diagramm nicht finden.`);
        });
        const lineChartUrl = this.lineChartController.generateChart(lineData).catch((e) => {
            throw new HandlerError(`Ich konnte das Diagramm nicht finden.`);
        });

        const finalResult = await Promise.all([pieChartUrl, barChartUrl, lineChartUrl]);
        return response
            .directive(buildDashboardDirective({
                q1: { bugs: 42, progress: '98%' },
                q2: { imageUrl: finalResult[0] },
                q3: { imageUrl: finalResult[1] },
                q4: { imageUrl: finalResult[2] }
            }))
            .say('Hier ist das Dashboard');
    }
}
