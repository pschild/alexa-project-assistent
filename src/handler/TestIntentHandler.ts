import { Inject } from 'typescript-ioc';
import { HandlerError } from '../error/HandlerError';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { LineChartController } from '../media/LineChartController';
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
        const ticketIdentifierValue = 'INK';
        const ticketNumberValue = '50';

        const issue: JiraIssue = await this.jiraController.getIssue(`${ticketIdentifierValue}-${ticketNumberValue}`);
        const testKeys = issue.getTestCoverage().getAllTestKeys();
        if (!testKeys.length) {
            return response.say(`Für ${sayJiraTicket(ticketIdentifierValue, ticketNumberValue)} sind keine Tests vorhanden.`);
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
