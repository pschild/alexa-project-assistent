import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../../endpoint/jira/domain/JiraIssue';
import { Inject } from 'typescript-ioc';
import { sayJiraTicket } from '../utils/speechUtils';
import {
    elicitSlot,
    confirmSlot,
    confirmIntent,
    ElicitationStatus,
    ConfirmationStatus,
    IIntentConfirmationResult,
    ISlotElicitationResult
} from '../utils/handlerUtils';
import { IssueTransitionStatus } from '../../endpoint/jira/domain/enum';
import { NotificationBuilder } from '../../apl/NotificationBuilder';
import { HandlerError } from '../error/HandlerError';
import AppState from '../../app/state/AppState';

export default class JiraChangeIssueStatusIntentHandler {

    @Inject
    protected appState: AppState;

    @Inject
    private notificationBuilder: NotificationBuilder;

    @Inject
    private controller: JiraEndpointController;

    private intentConfirmationResult: IIntentConfirmationResult;
    private identifierElicitationResult: ISlotElicitationResult;
    private numberElicitationResult: ISlotElicitationResult;
    private newStatusElicitationResult: ISlotElicitationResult;
    private issueKeysToChange: string[];
    private identifierValue: string;
    private numberValue: string;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        this.intentConfirmationResult = confirmIntent(request);
        this.identifierElicitationResult = elicitSlot(request, 'JiraTicketIdentifier', true);
        this.numberElicitationResult = elicitSlot(request, 'JiraTicketNumber');
        this.newStatusElicitationResult = elicitSlot(request, 'JiraIssueStatus', true);

        // ensure issue identifier
        if (this.identifierElicitationResult.status !== ElicitationStatus.SUCCESS) {
            return response
                .say(`Welche Bezeichnung hat das Ticket?`)
                .directive(this.identifierElicitationResult.directive)
                .shouldEndSession(false);
        } else {
            if (this.identifierElicitationResult.value !== 'AX') {
                throw new HandlerError(`Du kannst momentan nur Tickets mit der Bezeichnung A.X. ändern.`);
            }
        }
        this.identifierValue = this.identifierElicitationResult.value;

        // ensure issue number
        if (this.numberElicitationResult.status !== ElicitationStatus.SUCCESS) {
            return response
                .say(`Welche Nummer hat das Ticket?`)
                .directive(this.numberElicitationResult.directive)
                .shouldEndSession(false);
        }
        this.numberValue = this.numberElicitationResult.value;

        // load ticket
        const issue: JiraIssue = await this.controller
            .getIssue(`${this.identifierValue}-${this.numberValue}`)
            .catch((error) => {
                throw new HandlerError(
                    `Ich konnte das Ticket ${sayJiraTicket(this.identifierValue, this.numberValue)} nicht laden.`,
                    this.notificationBuilder.buildErrorNotification(
                        `Fehler beim Laden des Tickets ${this.identifierValue}-${this.numberValue}`
                    )
                );
            });
        this.issueKeysToChange = [`${this.identifierValue}-${this.numberValue}`];

        // ensure new status of issue
        if (this.newStatusElicitationResult.status !== ElicitationStatus.SUCCESS) {
            return response
                .say(
                    `In welchen Status soll ich ${sayJiraTicket(this.identifierValue, this.numberValue)} setzen? `
                    + `Ich kann Tickets als erledigt markieren oder in Bearbeitung setzen.`
                )
                .directive(this.newStatusElicitationResult.directive)
                .shouldEndSession(false);
        }
        const newStatusValue = request.slots.JiraIssueStatus.resolution().first().id;
        switch (newStatusValue) {
            case 'close':
                return this.handleDone(request, response, issue);
            case 'in_progress':
                return this.handleInProgress(request, response, issue);
            default:
                throw new HandlerError(`Unbekannter Status.`);
        }
    }

    private async handleDone(request: alexa.request, response: alexa.response, issue: JiraIssue) {
        const subtasks: JiraIssue[] = issue.getSubtasks();
        if (subtasks.length > 0) {
            const subtaskConfirmation = confirmSlot(request, 'JiraIssueStatus');
            if (subtaskConfirmation.status === ConfirmationStatus.NONE) { // including subtasks?
                return response
                    .say(
                        subtasks.length === 1
                            ? `Soll ich auch den Status des Untertickets ${sayJiraTicket(subtasks[0].key)} anpassen?`
                            : `Soll ich die Änderung auch für alle ${subtasks.length} Untertickets übernehmen?`
                    )
                    .directive(subtaskConfirmation.directive)
                    .shouldEndSession(false);

            } else if (subtaskConfirmation.status === ConfirmationStatus.CONFIRMED) { // including subtasks!
                if (this.intentConfirmationResult.status === ConfirmationStatus.NONE) { // intent confirmation?
                    return response
                        .say(`Ich schließe ${sayJiraTicket(this.identifierValue, this.numberValue)} und die Untertickets.`)
                        .say(`Bist du sicher?`)
                        .directive(this.intentConfirmationResult.directive)
                        .shouldEndSession(false);
                } else if (this.intentConfirmationResult.status === ConfirmationStatus.CONFIRMED) { // intent confirmed!
                    this.issueKeysToChange.push(...subtasks.map(subtask => subtask.key));
                    await this.changeStatusOfIssues(this.issueKeysToChange, IssueTransitionStatus.DONE);
                    return response
                        .say(
                            `Alles klar, ich habe ${sayJiraTicket(this.identifierValue, this.numberValue)} `
                            + `und ${subtasks.length} Unteraufgaben geschlossen`
                        )
                        .directive(
                            this.notificationBuilder.buildSuccessNotification(
                                `${this.identifierValue}-${this.numberValue} und ${subtasks.length} Unteraufgaben geschlossen!`
                            )
                        );
                } else { // intent denied
                    return response.say(`OK, ich werde nichts ändern.`);
                }
            }
        }

        if (this.intentConfirmationResult.status === ConfirmationStatus.NONE) { // without subtasks, intent confirmation?
            return response
                .say(`Ich schließe das Ticket ${sayJiraTicket(this.identifierValue, this.numberValue)}.`)
                .say(`Ist das OK?`)
                .directive(this.intentConfirmationResult.directive)
                .shouldEndSession(false);
        } else if (this.intentConfirmationResult.status === ConfirmationStatus.CONFIRMED) { // intent confirmed!
            await this.changeStatusOfIssues(this.issueKeysToChange, IssueTransitionStatus.DONE);
            return response
                .say(`Gut, ich habe das Ticket ${sayJiraTicket(this.identifierValue, this.numberValue)} geschlossen.`)
                .directive(
                    this.notificationBuilder.buildSuccessNotification(`${this.identifierValue}-${this.numberValue} geschlossen!`)
                );
        } else { // intent denied
            return response.say(`OK, ich werde nichts ändern.`);
        }
    }

    private async handleInProgress(request: alexa.request, response: alexa.response, issue: JiraIssue) {
        const parent: JiraIssue = issue.getParent();
        if (parent) {
            const parentConfirmation = confirmSlot(request, 'JiraIssueStatus');
            if (parentConfirmation.status === ConfirmationStatus.NONE) { // including parent?
                return response
                    .say(`Soll ich die Änderung auch für das übergeordnete Ticket ${sayJiraTicket(parent.key)} übernehmen?`)
                    .directive(parentConfirmation.directive)
                    .shouldEndSession(false);

            } else if (parentConfirmation.status === ConfirmationStatus.CONFIRMED) { // including parent!
                if (this.intentConfirmationResult.status === ConfirmationStatus.NONE) { // intent confirmation?
                    return response
                        .say(
                            `Ich nehme ${sayJiraTicket(this.identifierValue, this.numberValue)} `
                            + `und das übergeordnete Ticket ${sayJiraTicket(parent.key)} in Bearbeitung. `
                            + `Bist du sicher?`
                        )
                        .directive(this.intentConfirmationResult.directive)
                        .shouldEndSession(false);
                } else if (this.intentConfirmationResult.status === ConfirmationStatus.CONFIRMED) { // intent confirmed
                    this.issueKeysToChange.push(parent.key);
                    await this.changeStatusOfIssues(this.issueKeysToChange, IssueTransitionStatus.IN_PROGRESS);
                    return response
                        .say(
                            `Ich habe ${sayJiraTicket(this.identifierValue, this.numberValue)} `
                            + `und das übergeordnete Ticket ${sayJiraTicket(parent.key)} in Bearbeitung genommen.`
                        )
                        .directive(
                            this.notificationBuilder.buildSuccessNotification(
                                `${this.identifierValue}-${this.numberValue} und ${parent.key} in Bearbeitung genommen!`
                            )
                        );
                } else { // intent denied
                    return response.say(`OK, ich werde nichts ändern.`);
                }
            }
        }

        if (this.intentConfirmationResult.status === ConfirmationStatus.NONE) { // without parent, intent confirmation?
            return response
                .say(`Ich nehme ${sayJiraTicket(this.identifierValue, this.numberValue)} in Bearbeitung.`)
                .say(`Einverstanden?`)
                .directive(this.intentConfirmationResult.directive)
                .shouldEndSession(false);
        } else if (this.intentConfirmationResult.status === ConfirmationStatus.CONFIRMED) { // intent confirmed
            await this.changeStatusOfIssues(this.issueKeysToChange, IssueTransitionStatus.IN_PROGRESS);
            return response
                .say(`OK, ich habe ${sayJiraTicket(this.identifierValue, this.numberValue)} in Bearbeitung genommen.`)
                .directive(
                    this.notificationBuilder.buildSuccessNotification(
                        `${this.identifierValue}-${this.numberValue} in Bearbeitung genommen!`
                    )
                );
        } else { // intent denied
            return response.say(`Na gut, ich werde nichts ändern.`);
        }
    }

    private async changeStatusOfIssues(issueKeys: string[], newStatus: IssueTransitionStatus) {
        return Promise.all(
            issueKeys.map(key => this.controller.changeIssueStatus(key, newStatus))
        );
    }
}
