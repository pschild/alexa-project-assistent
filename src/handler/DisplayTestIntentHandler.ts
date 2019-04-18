import * as alexa from 'alexa-app';
import { buildImageDirective } from '../apl/datasources';

import { Inject } from 'typescript-ioc';
import { PieChartController, IPieChartDataItem } from '../media/PieChartController';
import { HandlerError } from '../error/HandlerError';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { LineChartController } from '../media/LineChartController';

export default class DisplayTestIntentHandler {

    @Inject
    private lineChartController: LineChartController;

    @Inject
    private jiraController: JiraEndpointController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        // const data: IPieChartDataItem[] = [
        //     { label: 'A', value: '20' },
        //     { label: 'B', value: '50' },
        //     { label: 'D', value: '30' }
        // ];
        // const chartUrl = await this.controller.generateChart(data).catch((e) => {
        //     throw new HandlerError(`Ich konnte das Diagramm nicht finden.`);
        // });

        const burndownData = await this.jiraController.getBurndownData(48, 58);
        const chartData = burndownData.map(row => ({ key: new Date(row.key), value: row.value / 3600 }));
        const chartUrl = await this.lineChartController.generateChart(chartData).catch((e) => {
            throw new HandlerError(`Ich konnte das Diagramm nicht finden.`);
        });

        return response
            .directive(buildImageDirective({
                title: `Burndownchart`,
                imageUrl: chartUrl
            }))
            .say('Triggered DisplayTestIntent');
    }
}
