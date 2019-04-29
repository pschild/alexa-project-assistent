import * as alexa from 'alexa-app';
import { buildImageDirective, buildBuildStatusDirective, buildMergeRequestsDirective } from '../apl/datasources';

import { Inject } from 'typescript-ioc';
import { PieChartController, IPieChartDataItem } from '../media/PieChartController';
import { HandlerError } from '../error/HandlerError';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { LineChartController, ILineChartDataItem } from '../media/LineChartController';
import { NotificationBuilder } from '../apl/NotificationBuilder';
import AppState from '../app/state/AppState';
import * as humanizeDuration from 'humanize-duration';
import { GitlabEndpointController } from '../endpoint/gitlab/GitlabEndpointController';
import { GitlabMergeRequest } from '../endpoint/gitlab/domain/GitlabMergeRequest';

export default class DisplayTestIntentHandler {

    @Inject
    private appState: AppState;

    @Inject
    private lineChartController: LineChartController;

    @Inject
    private jiraController: JiraEndpointController;

    @Inject
    private gitLabController: GitlabEndpointController;

    @Inject
    private notificationBuilder: NotificationBuilder;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        // const data: IPieChartDataItem[] = [
        //     { label: 'A', value: '20' },
        //     { label: 'B', value: '50' },
        //     { label: 'D', value: '30' }
        // ];
        // const chartUrl = await this.controller.generateChart(data).catch((e) => {
        //     throw new HandlerError(`Ich konnte das Diagramm nicht finden.`);
        // });

        // let { burndownData, idealData } = await this.jiraController.getBurndownData(48, 58);
        // burndownData = burndownData.map(row => ({ key: new Date(row.key), value: row.value / 3600 }));
        // idealData = idealData.map(row => ({ key: new Date(row.key), value: row.value / 3600 }));

        // const chartData: ILineChartDataItem[] = [
        //     { name: 'burndownData', values: burndownData, isStepped: true },
        //     { name: 'idealData', values: idealData }
        // ];

        // const chartUrl = await this.lineChartController.generateChart(chartData).catch((e) => {
        //     throw new HandlerError(`Ich konnte das Diagramm nicht finden.`);
        // });

        // return response
        //     .directive(buildImageDirective({
        //         title: `Burndownchart`,
        //         imageUrl: chartUrl
        //     }))
        //     .say('Triggered DisplayTestIntent');

        return response.say('jjasd').directive(this.notificationBuilder.buildWarningNotification('cool!'));
    }
}
