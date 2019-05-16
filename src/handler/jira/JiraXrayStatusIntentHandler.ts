import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { Inject } from 'typescript-ioc';
import { PieChartController, IPieChartDataItem } from '../../media/PieChartController';
import { buildXrayStatusDirective } from '../../apl/datasources';
import { JiraIssue } from '../../endpoint/jira/domain/JiraIssue';
import { sayJiraTicket } from '../utils/speechUtils';
import { TestRunStatus } from '../../endpoint/jira/domain/enum';
import AppState from '../../app/state/AppState';
import { HandlerError } from '../error/HandlerError';
import { elicitSlot, ElicitationStatus, sendProgressiveResponse } from '../utils/handlerUtils';
import IIntentHandler from '../IIntentHandler';

export default class JiraXrayStatusIntentHandler implements IIntentHandler {

    @Inject
    private appState: AppState;

    @Inject
    private controller: JiraEndpointController;

    @Inject
    private pieChartController: PieChartController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const identifierElicitationResult = elicitSlot(request, 'JiraTicketIdentifier', true);
        if (identifierElicitationResult.status !== ElicitationStatus.SUCCESS) {
            return response
                .say(`Welche Bezeichnung hat das Ticket?`)
                .directive(identifierElicitationResult.directive)
                .shouldEndSession(false);
        }

        const numberElicitationResult = elicitSlot(request, 'JiraTicketNumber');
        if (numberElicitationResult.status !== ElicitationStatus.SUCCESS) {
            return response
                .say(`Welche Nummer hat das Ticket?`)
                .directive(numberElicitationResult.directive)
                .shouldEndSession(false);
        }

        const ticketIdentifierValue = identifierElicitationResult.value;
        const ticketNumberValue = numberElicitationResult.value;
        console.log(ticketIdentifierValue, ticketNumberValue);

        const issue: JiraIssue = await this.controller.getIssue(`${ticketIdentifierValue}-${ticketNumberValue}`);
        if (!issue.getTestCoverage() || !issue.getTestCoverage().getAllTestKeys()) {
            return response.say(`Für ${sayJiraTicket(ticketIdentifierValue, ticketNumberValue)} sind keine Tests vorhanden.`);
        }

        sendProgressiveResponse(request, `Alles klar, ich erstelle eine Übersicht.`);

        const testKeys = issue.getTestCoverage().getAllTestKeys();
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
            .setTextColor('#fff')
            .setColorRange(['#95C160', '#D45D52', '#A2A6AE', '#F1E069', '#111111'])
            .generateChart(data).catch((e) => {
                throw new HandlerError(`Ich konnte das Diagramm nicht erstellen.`);
            });

        let ticketDescription = issue.fields.summary;
        if (ticketDescription.length > 50) {
            ticketDescription = ticketDescription.substr(0, 50) + '...';
        }

        let globalStateText;
        if (globalState === TestRunStatus.EXECUTING) {
            globalStateText = `Es werden momentan noch Tests ausgeführt.`;
        } else if (globalState === TestRunStatus.FAIL) {
            globalStateText = 'Die Tests sind nicht in Ordnung, da es mindestens einen fehlgeschlagenen Test gibt.';
        } else {
            globalStateText = 'Insgesamt sind die Tests in Ordnung.';
        }

        return response
            .directive(buildXrayStatusDirective({
                backgroundImageUrl: this.appState.getBaseUrl() + 'static/neon60l.png',
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
            .say(`So, hier sind die aktuellen Testergebnisse für ${sayJiraTicket(ticketIdentifierValue, ticketNumberValue)}.`)
            .say(globalStateText);
    }

    private getIconUrlByStatus(status: TestRunStatus): string {
        const passIconUrl = this.appState.getBaseUrl() + `static/success.png`;
        const failIconUrl = this.appState.getBaseUrl() + `static/error.png`;
        const todoIconUrl = this.appState.getBaseUrl() + `static/todo.png`;
        const executingIconUrl = this.appState.getBaseUrl() + `static/in_progress.png`;
        const abortedIconUrl = this.appState.getBaseUrl() + `static/abort.png`;

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
