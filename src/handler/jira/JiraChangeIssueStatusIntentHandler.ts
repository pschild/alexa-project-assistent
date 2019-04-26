import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../../endpoint/jira/domain/JiraIssue';
import { Inject } from 'typescript-ioc';
import { HandlerError } from '../../error/HandlerError';
import { sayJiraTicket } from '../../app/speechUtils';
import { elicitSlot, ElicitationStatus, confirmSlot, ConfirmationStatus, confirmIntent } from '../handlerUtils';
import { IssueTransitionStatus } from '../../endpoint/jira/domain/enum';

export default class JiraChangeIssueStatusIntentHandler {

    @Inject
    private controller: JiraEndpointController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const intentConfirmationResult = confirmIntent(request);
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
        const identifierValue = identifierElicitationResult.value;

        if (numberElicitationResult.status !== ElicitationStatus.SUCCESS) {
            return response
                .say(`Nummer?`)
                .directive(numberElicitationResult.directive)
                .shouldEndSession(false);
        }
        const numberValue = numberElicitationResult.value;

        if (newStatusElicitationResult.status !== ElicitationStatus.SUCCESS) {
            return response
                .say(`In welchen Status soll ich ${sayJiraTicket(identifierValue, numberValue)}`)
                .directive(newStatusElicitationResult.directive)
                .shouldEndSession(false);
        }
        const newStatusValue = request.slots.JiraIssueStatus.resolution().first().id;

        const issue: JiraIssue = await this.controller.getIssue(`${identifierValue}-${numberValue}`);
        const issueKeysToChange = [`${identifierValue}-${numberValue}`];
        switch (newStatusValue) {
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
                        if (intentConfirmationResult.status === ConfirmationStatus.NONE) {
                            return response
                                .say(`Ich schließe ${sayJiraTicket(identifierValue, numberValue)} und die Untertickets.`)
                                .say(`Sicher?`)
                                .directive(intentConfirmationResult.directive)
                                .shouldEndSession(false);
                        } else if (intentConfirmationResult.status === ConfirmationStatus.CONFIRMED) {
                            issueKeysToChange.push(...subtasks.map(subtask => subtask.key));
                            await this.changeStatusOfIssues(issueKeysToChange, IssueTransitionStatus.DONE);
                            return response.say(`OK, ich habe ticket und unteraufgaben geschlossen`);
                        } else {
                            return response.say(`OK, dann nicht`);
                        }
                    }
                }

                if (intentConfirmationResult.status === ConfirmationStatus.NONE) {
                    return response
                        .say(`Ich schließe nur ${sayJiraTicket(identifierValue, numberValue)}.`)
                        .say(`Sicher?`)
                        .directive(intentConfirmationResult.directive)
                        .shouldEndSession(false);
                } else if (intentConfirmationResult.status === ConfirmationStatus.CONFIRMED) {
                    await this.changeStatusOfIssues(issueKeysToChange, IssueTransitionStatus.DONE);
                    return response.say(`OK, ich habe ticket geschlossen`);
                } else {
                    return response.say(`OK, dann nicht`);
                }

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
                        if (intentConfirmationResult.status === ConfirmationStatus.NONE) {
                            return response
                                .say(
                                    `Ich nehme ${sayJiraTicket(identifierValue, numberValue)} `
                                    + `und das übergeordnete Ticket ${sayJiraTicket(parent.key)} in Bearbeitung. `
                                    + `Sicher?`
                                )
                                .directive(intentConfirmationResult.directive)
                                .shouldEndSession(false);
                        } else if (intentConfirmationResult.status === ConfirmationStatus.CONFIRMED) {
                            issueKeysToChange.push(parent.key);
                            await this.changeStatusOfIssues(issueKeysToChange, IssueTransitionStatus.IN_PROGRESS);
                            return response.say(
                                `Ich habe ${sayJiraTicket(identifierValue, numberValue)} `
                                + `und das übergeordnete Ticket ${sayJiraTicket(parent.key)} in Bearbeitung genommen.`
                            );
                        } else {
                            return response.say(`OK, dann nicht`);
                        }
                    }
                }

                if (intentConfirmationResult.status === ConfirmationStatus.NONE) {
                    return response
                        .say(`Ich nehme ${sayJiraTicket(identifierValue, numberValue)} in Bearbeitung.`)
                        .say(`Sicher?`)
                        .directive(intentConfirmationResult.directive)
                        .shouldEndSession(false);
                } else if (intentConfirmationResult.status === ConfirmationStatus.CONFIRMED) {
                    await this.changeStatusOfIssues(issueKeysToChange, IssueTransitionStatus.IN_PROGRESS);
                    return response.say(`OK, ich habe ${sayJiraTicket(identifierValue, numberValue)} in Bearbeitung genommen.`);
                } else {
                    return response.say(`OK, dann nicht`);
                }
            default:
                throw new HandlerError(`Unbekannter Status.`);
        }
    }

    private async changeStatusOfIssues(issueKeys: string[], newStatus: IssueTransitionStatus) {
        return Promise.all(
            issueKeys.map(key => this.controller.changeIssueStatus(key, newStatus))
        );
    }
}
