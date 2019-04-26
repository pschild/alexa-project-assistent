import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../../endpoint/jira/domain/JiraIssue';
import { Inject } from 'typescript-ioc';
import { HandlerError } from '../../error/HandlerError';
import { buildErrorNotification } from '../../apl/datasources';
import { sayJiraTicket, pause, sayAsDuration } from '../../app/speechUtils';
import { elicitSlot, ElicitationStatus, confirmSlot, ConfirmationStatus } from '../handlerUtils';
import { IssueTransitionStatus } from '../../endpoint/jira/domain/enum';

export default class JiraChangeIssueStatusIntentHandler {

    @Inject
    private controller: JiraEndpointController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const identifierElicitationResult = elicitSlot(request, 'JiraTicketIdentifier', true);
        const numberElicitationResult = elicitSlot(request, 'JiraTicketNumber');
        const newStatusElicitationResult = elicitSlot(request, 'JiraIssueStatus', true);

        if (identifierElicitationResult.status !== ElicitationStatus.SUCCESS) {
            return response
                .say(`Welche Bezeichnung?`)
                .directive(identifierElicitationResult.directive)
                .shouldEndSession(false);
        } else {
            if (identifierElicitationResult.value !== 'AX') {
                throw new HandlerError(`Du kannst momentan nur Tickets mit der Bezeichnung A.X. ändern.`);
            }
        }

        if (numberElicitationResult.status !== ElicitationStatus.SUCCESS) {
            return response
                .say(`Nummer?`)
                .directive(numberElicitationResult.directive)
                .shouldEndSession(false);
        }

        if (newStatusElicitationResult.status !== ElicitationStatus.SUCCESS) {
            return response
                .say(`Was ist damit?`)
                .directive(newStatusElicitationResult.directive)
                .shouldEndSession(false);
        }

        const identifierValue = identifierElicitationResult.value;
        const numberValue = numberElicitationResult.value;
        const actionValue = request.slots.JiraIssueStatus.resolution().first().id;
        const issue: JiraIssue = await this.controller.getIssue(`${identifierValue}-${numberValue}`);
        switch (actionValue) {
            case 'close':
                const subtasks: JiraIssue[] = issue.getSubtasks();
                if (subtasks.length > 0) {
                    const subtaskConfirmation = confirmSlot(request, 'JiraIssueStatus');
                    if (subtaskConfirmation.status === ConfirmationStatus.NONE) {
                        return response
                            .say(
                                subtasks.length === 1
                                    ? `Auch das Unterticket ${sayJiraTicket(subtasks[0].key)}?`
                                    : `Auch alle ${subtasks.length} Untertickets?`
                            )
                            .directive(subtaskConfirmation.directive)
                            .shouldEndSession(false);

                    } else if (subtaskConfirmation.status === ConfirmationStatus.CONFIRMED) {
                        await this.controller.changeIssueStatus(`${identifierValue}-${numberValue}`, IssueTransitionStatus.DONE);
                        await Promise.all(
                            subtasks.map(subtask => this.controller.changeIssueStatus(subtask.key, IssueTransitionStatus.DONE))
                        );
                        return response
                            .say(`Ich habe ${sayJiraTicket(identifierValue, numberValue)} und die Untertickets geschlossen.`);
                    }
                }

                await this.controller.changeIssueStatus(`${identifierValue}-${numberValue}`, IssueTransitionStatus.DONE);
                return response
                    .say(`Ich habe ${sayJiraTicket(identifierValue, numberValue)} geschlossen.`);

            case 'in_progress':
                const parent: JiraIssue = issue.getParent();
                if (parent) {
                    const parentConfirmation = confirmSlot(request, 'JiraIssueStatus');
                    if (parentConfirmation.status === ConfirmationStatus.NONE) {
                        return response
                            .say(`Auch das übergeordnete Ticket ${sayJiraTicket(parent.key)}?`)
                            .directive(parentConfirmation.directive)
                            .shouldEndSession(false);

                    } else if (parentConfirmation.status === ConfirmationStatus.CONFIRMED) {
                        await this.controller.changeIssueStatus(`${identifierValue}-${numberValue}`, IssueTransitionStatus.IN_PROGRESS);
                        await this.controller.changeIssueStatus(parent.key, IssueTransitionStatus.IN_PROGRESS);
                        return response
                            .say(
                                `Ich habe ${sayJiraTicket(identifierValue, numberValue)} `
                                + `und das übergeordnete Ticket ${sayJiraTicket(parent.key)} in Bearbeitung genommen.`
                            );
                    }
                }

                await this.controller.changeIssueStatus(`${identifierValue}-${numberValue}`, IssueTransitionStatus.IN_PROGRESS);
                return response
                    .say(`Ich habe ${sayJiraTicket(identifierValue, numberValue)} in Bearbeitung genommen.`);
            default:
                throw new HandlerError(`Unbekannter Status.`);
        }
    }
}
