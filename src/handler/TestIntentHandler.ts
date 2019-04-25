import { Inject } from 'typescript-ioc';
import { HandlerError } from '../error/HandlerError';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { LineChartController, ILineChartDataItem } from '../media/LineChartController';
import { BarChartController } from '../media/BarChartController';
import { PieChartController, IPieChartDataItem } from '../media/PieChartController';
import { JiraIssue } from '../endpoint/jira/domain/JiraIssue';
import { TestRunStatus } from '../endpoint/jira/domain/enum';
import { sayJiraTicket } from '../app/speechUtils';

export default class TestIntentHandler {

    @Inject
    private lineChartController: LineChartController;

    @Inject
    private pieChartController: PieChartController;

    @Inject
    private barChartController: BarChartController;

    @Inject
    private jiraController: JiraEndpointController;

    public async handle(request, response): Promise<any> {
        return this.getBdc();
    }

    private async getBdc() {
        const burndownData = (await this.jiraController.getBurndownData(50, 54))
            .map(row => ({ key: new Date(row.key), value: row.value / 3600 }));
        const idealData = [
            { key: 1553857260000, value: 892800 },
            { key: 1555002000000, value: 0 }
        ].map(row => ({ key: new Date(row.key), value: row.value / 3600 }));
        const chartData: ILineChartDataItem[] = [
            { name: 'burndownData', values: burndownData, isStepped: true },
            { name: 'idealData', values: idealData }
        ];
        const chartUrl = await this.lineChartController
            .setLineColors(['#d04437', '#999'])
            .generateChart(chartData).catch((e) => {
                throw new HandlerError(`Ich konnte das Diagramm nicht finden.`);
            });
        return chartUrl;
    }

    private async getXrayStatus() {
        const ticketIdentifierValue = 'INK';
        const ticketNumberValue = '50';

        const issue: JiraIssue = await this.jiraController.getIssue(`${ticketIdentifierValue}-${ticketNumberValue}`);
        const testKeys = issue.getTestCoverage().getAllTestKeys();
        if (!testKeys.length) {
            console.log(`Für ${sayJiraTicket(ticketIdentifierValue, ticketNumberValue)} sind keine Tests vorhanden.`);
            return;
        }

        const finalResult = await Promise.all(testKeys.map(key => this.jiraController.getLatestTestrunByTestIssue(key)));

        const latestStatusMap = [];
        for (let i = 0; i < testKeys.length; i++) {
            latestStatusMap.push({ key: testKeys[i], status: finalResult[i] ? finalResult[i].status : TestRunStatus.TODO });
        }
        console.log(latestStatusMap);

        const data: IPieChartDataItem[] = [
            { label: 'PASS', value: latestStatusMap.filter(item => item.status === TestRunStatus.PASS).length },
            { label: 'FAIL', value: latestStatusMap.filter(item => item.status === TestRunStatus.FAIL).length },
            { label: 'TODO', value: latestStatusMap.filter(item => item.status === TestRunStatus.TODO).length },
            { label: 'EXECUTING', value: latestStatusMap.filter(item => item.status === TestRunStatus.EXECUTING).length },
            { label: 'ABORTED', value: latestStatusMap.filter(item => item.status === TestRunStatus.ABORTED).length }
        ];
        const chartUrl = await this.pieChartController
            .setTextColor('#fff')
            .setColorRange(['#95C160', '#D45D52', '#A2A6AE', '#F1E069', '#111111'])
            .generateChart(data).catch((e) => {
                throw new HandlerError(`Ich konnte das Diagramm nicht erstellen.`);
            });
        console.log(chartUrl);
        return chartUrl;
    }
}
