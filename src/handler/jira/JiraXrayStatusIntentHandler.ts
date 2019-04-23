import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { Inject } from 'typescript-ioc';
import { HandlerError } from '../../error/HandlerError';
import { PieChartController, IPieChartDataItem } from '../../media/PieChartController';
import { buildXrayStatusDirective, buildErrorNotification } from '../../apl/datasources';
import { JiraIssue } from '../../endpoint/jira/domain/JiraIssue';
import { sayJiraTicket, sayInEnglish } from '../../app/speechUtils';
import { TestRunStatus } from '../../endpoint/jira/domain/enum';

export default class JiraXrayStatusIntentHandler {

    @Inject
    private controller: JiraEndpointController;

    @Inject
    private pieChartController: PieChartController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        if (!request.getDialog().isCompleted()) {
            const updatedIntent = request.data.request.intent;
            return response
                .directive({
                    type: 'Dialog.Delegate',
                    updatedIntent
                })
                .shouldEndSession(false);
        }

        const ticketIdentifierValue = request.slot('JiraTicketIdentifier');
        const ticketNumberValue = request.slot('JiraTicketNumber');
        console.log(ticketIdentifierValue, ticketNumberValue);

        const issue: JiraIssue = await this.controller.getIssue(`${ticketIdentifierValue}-${ticketNumberValue}`);
        const testKeys = issue.getTestCoverage().getAllTestKeys();
        if (!testKeys.length) {
            return response.say(`Für ${sayJiraTicket(ticketIdentifierValue, ticketNumberValue)} sind keine Tests vorhanden.`);
        }

        const finalResult = await Promise.all(testKeys.map(key => this.controller.getLatestTestrunByTestIssue(key)));

        const latestStatusMap = [];
        for (let i = 0; i < testKeys.length; i++) {
            latestStatusMap.push({ key: testKeys[i], status: finalResult[i] ? finalResult[i].status : TestRunStatus.TODO });
        }
        console.log(latestStatusMap);
        const globalState = this.calculateGlobalStatus(latestStatusMap);

        const data: IPieChartDataItem[] = [
            { label: 'PASS', value: latestStatusMap.filter(item => item.status === TestRunStatus.PASS).length },
            { label: 'FAIL', value: latestStatusMap.filter(item => item.status === TestRunStatus.FAIL).length },
            { label: 'TODO', value: latestStatusMap.filter(item => item.status === TestRunStatus.TODO).length },
            { label: 'EXECUTING', value: latestStatusMap.filter(item => item.status === TestRunStatus.EXECUTING).length },
            { label: 'ABORTED', value: latestStatusMap.filter(item => item.status === TestRunStatus.ABORTED).length }
        ];
        const chartUrl = await this.pieChartController
            .setColors(['#95C160', '#D45D52', '#A2A6AE', '#F1E069', '#111111'])
            .generateChart(data).catch((e) => {
                throw new HandlerError(`Ich konnte das Diagramm nicht erstellen.`);
            });
        console.log(chartUrl);

        let ticketDescription = issue.fields.summary;
        if (ticketDescription.length > 50) {
            ticketDescription = ticketDescription.substr(0, 50) + '...';
        }

        let globalStateText;
        if (globalState === TestRunStatus.EXECUTING) {
            globalStateText = 'Es werden momentan noch Tests für das Ticket ausgeführt.';
        } else if (globalState === TestRunStatus.FAIL) {
            globalStateText = 'Die Tests sind nicht in Ordnung, da es mindestens einen fehlgeschlagenen Test gibt.';
        } else {
            globalStateText = 'Insgesamt sind die Tests in Ordnung.';
        }

        return response
            .directive(buildXrayStatusDirective({
                imageUrl: chartUrl,
                globalStateIconUrl: this.getIconUrlByStatus(globalState),
                ticketId: issue.key,
                ticketDescription,
                listData: latestStatusMap.map(item => {
                    return {
                        label: item.key,
                        iconUrl: this.getIconUrlByStatus(item.status)
                    };
                })
            }))
            .say(`Hier sind die aktuellen Testergebnisse für ${sayJiraTicket(ticketIdentifierValue, ticketNumberValue)}.`)
            .say(globalStateText);
    }

    private getIconUrlByStatus(status: TestRunStatus): string {
        const passIconUrl = 'https://www.materialui.co/materialIcons/toggle/check_box_black_192x192.png';
        const failIconUrl = 'https://www.materialui.co/materialIcons/alert/error_red_192x192.png';
        const todoIconUrl = 'https://www.materialui.co/materialIcons/action/hourglass_empty_black_192x192.png';
        const executingIconUrl = 'https://www.materialui.co/materialIcons/image/timelapse_black_192x192.png';
        const abortedIconUrl = 'https://www.materialui.co/materialIcons/navigation/cancel_black_108x108.png';

        switch (status) {
            case TestRunStatus.PASS:
                return passIconUrl;
            case TestRunStatus.FAIL:
                return failIconUrl;
            case TestRunStatus.TODO:
                return todoIconUrl;
            case TestRunStatus.EXECUTING:
                return executingIconUrl;
            case TestRunStatus.ABORTED:
                return abortedIconUrl;
        }
    }

    private calculateGlobalStatus(latestStatusMap): TestRunStatus {
        if (latestStatusMap.filter(item => item.status === TestRunStatus.EXECUTING).length > 0) {
            return TestRunStatus.EXECUTING;
        } else if (latestStatusMap.filter(item => item.status === TestRunStatus.FAIL).length > 0) {
            return TestRunStatus.FAIL;
        } else {
            return TestRunStatus.PASS;
        }
    }
}
