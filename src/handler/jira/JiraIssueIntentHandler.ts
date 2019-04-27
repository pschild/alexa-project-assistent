import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../../endpoint/jira/domain/JiraIssue';
import { Inject } from 'typescript-ioc';
import { HandlerError } from '../../error/HandlerError';
import { sayJiraTicket, pause, sayAsDuration } from '../../app/speechUtils';
import { NotificationBuilder } from '../../apl/NotificationBuilder';

export default class JiraIssueIntentHandler {

    @Inject
    private notificationBuilder: NotificationBuilder;

    @Inject
    private controller: JiraEndpointController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        if (!request.getDialog().isCompleted()) {
            const updatedIntent = request.data.request.intent;
            if (!request.getSession().get('jiraTicketId') || !request.getSession().get('jiraTicketNo')) {
                return response
                    .directive({
                        type: 'Dialog.Delegate',
                        updatedIntent
                    })
                    .shouldEndSession(false);
            }
        }

        const issueProperty = request.slot('JiraIssueProperty');
        const ticketIdentifierValue = request.slot('JiraTicketIdentifier') || request.getSession().get('jiraTicketId');
        const ticketNumberValue = request.slot('JiraTicketNumber') || request.getSession().get('jiraTicketNo');
        console.log(issueProperty, ticketIdentifierValue, ticketNumberValue);

        const issue: JiraIssue = await this.controller
            .getIssue(`${ticketIdentifierValue}-${ticketNumberValue}`)
            .catch((error) => {
                throw new HandlerError(
                    `Ich konnte das Ticket ${sayJiraTicket(ticketIdentifierValue, ticketNumberValue)} nicht laden.`,
                    this.notificationBuilder.buildErrorNotification(
                        `Fehler beim Laden des Tickets ${ticketIdentifierValue}-${ticketNumberValue}`
                    )
                );
            });

        if (!issue) {
            throw new HandlerError(
                `Ich habe Probleme, das Ticket ${sayJiraTicket(ticketIdentifierValue, ticketNumberValue)} auszuwerten.`,
                this.notificationBuilder.buildErrorNotification(
                    `Fehler beim Auswerten des Tickets ${ticketIdentifierValue}-${ticketNumberValue}`
                )
            );
        }

        request.getSession().set('jiraTicketId', ticketIdentifierValue);
        request.getSession().set('jiraTicketNo', ticketNumberValue);

        if (issueProperty === 'bearbeiter') {
            response.say(this.addAssigneeSpeech(issue));
            response.directive(this.addAssigneeDisplay(issue));
        } else if (issueProperty === 'titel') {
            response.say(this.addTitleSpeech(issue));
        } else if (issueProperty === 'zeit') {
            response.say(this.addEstimationSpeech(issue));
        } else if (issueProperty === 'zusammenfassung') {
            response.say(this.addAssigneeSpeech(issue));
            response.say(this.addTitleSpeech(issue));
            response.say(this.addEstimationSpeech(issue));
        }

        return response.shouldEndSession(false);
    }

    private addAssigneeSpeech(issue: JiraIssue) {
        const issueKeyParts = issue.key.split('-');
        return `Das Ticket ${sayJiraTicket(issueKeyParts[0], issueKeyParts[1])} ist `
            + `${issue.getAssignee() ? issue.getAssignee().getFullName() : 'keinem Mitarbeiter'}`
            + ` zugewiesen. `;
    }

    private addAssigneeDisplay(issue: JiraIssue): { type: string, template: any } {
        if (!issue.getAssignee()) {
            return;
        }
        return {
            type: 'Display.RenderTemplate',
            template: {
                type: 'BodyTemplate1',
                backButton: 'HIDDEN',
                backgroundImage: {
                    contentDescription: '',
                    sources: [{
                        url: issue.getAssignee().avatarUrls['48x48'] || '',
                        size: 'LARGE'
                    }]
                },
                textContent: {
                    primaryText: {
                        text: `<div align='center'>${issue.getAssignee().displayName || 'N/A'}</div>`,
                        type: 'RichText'
                    }
                }
            }
        };
    }

    private addTitleSpeech(issue: JiraIssue) {
        return `Die Bezeichnung lautet: ${pause(200)} ${issue.fields.summary}. `;
    }

    private addEstimationSpeech(issue: JiraIssue): string {
        let speech = '';
        if (issue.getRemainingEstimateSeconds()) {
            speech = `Der Restaufwand beträgt ${sayAsDuration(issue.getRemainingEstimateSeconds())}. `;
        }
        if (issue.getOriginalEstimateSeconds() && issue.getOriginalEstimateSeconds() !== issue.getRemainingEstimateSeconds()) {
            speech += `${pause(50)}Ursprünglich geschätzt waren ${sayAsDuration(issue.getOriginalEstimateSeconds())}. `;
        }
        if (!issue.getRemainingEstimateSeconds() && !issue.getOriginalEstimateSeconds()) {
            speech = `Es sind keine Informationen über den Aufwand verfügbar. `;
        }
        return speech;
    }

}
