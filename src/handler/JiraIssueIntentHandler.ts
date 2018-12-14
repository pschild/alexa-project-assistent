import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../endpoint/jira/domain/JiraIssue';
import { Inject } from 'typescript-ioc';
import { AbstractIntentHandler } from './AbstractIntentHandler';
import { HandlerError } from '../error/HandlerError';
import { buildErrorNotification } from '../apl/datasources';
import { sayJiraTicket, pause } from '../app/speechUtils';

export default class JiraIssueIntentHandler extends AbstractIntentHandler {

    @Inject
    private controller: JiraEndpointController;

    protected async handleSpecificIntent(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        if (!request.getDialog().isCompleted()) {
            const updatedIntent = request.data.request.intent;
            if (!this.session.get('jiraTicketId') || !this.session.get('jiraTicketNo')) {
                return response
                    .directive({
                        type: 'Dialog.Delegate',
                        updatedIntent
                    })
                    .shouldEndSession(false);
            }
        }

        const ticketActionValue = request.slot('JiraTicketAction');
        const ticketIdentifierValue = request.slot('JiraTicketIdentifier') || this.session.get('jiraTicketId');
        const ticketNumberValue = request.slot('JiraTicketNumber') || this.session.get('jiraTicketNo');
        console.log(ticketActionValue, ticketIdentifierValue, ticketNumberValue);

        const issue: JiraIssue = await this.controller
            .getIssue(`${ticketIdentifierValue}-${ticketNumberValue}`)
            .catch((error) => {
                throw new HandlerError(
                    `Ich konnte das Ticket ${sayJiraTicket(ticketIdentifierValue, ticketNumberValue)} nicht laden.`,
                    buildErrorNotification('Fehler', `Fehler beim Laden des Tickets ${ticketIdentifierValue}-${ticketNumberValue}`)
                );
            });

        if (!issue) {
            throw new HandlerError(
                `Ich habe Probleme, das Ticket ${sayJiraTicket(ticketIdentifierValue, ticketNumberValue)} auszuwerten.`,
                buildErrorNotification('Fehler', `Fehler beim Auswerten des Tickets ${ticketIdentifierValue}-${ticketNumberValue}`)
            );
        }

        this.session.set('jiraTicketId', ticketIdentifierValue);
        this.session.set('jiraTicketNo', ticketNumberValue);

        let speech: string = '';
        if (ticketActionValue === 'bearbeiter') {
            speech += this.addAssigneeSpeech(issue);
            this.addDirective(this.addAssigneeDisplay(issue));
        } else if (ticketActionValue === 'titel') {
            speech += this.addTitleSpeech(issue);
        } else if (ticketActionValue === 'zeit') {
            speech += this.addEstimationSpeech(issue);
        } else if (ticketActionValue === 'zusammenfassung') {
            speech += this.addAssigneeSpeech(issue);
            speech += this.addTitleSpeech(issue);
            speech += this.addEstimationSpeech(issue);
        }

        this.outputDirectives.map((d) => response.directive(d));
        response.say(speech).shouldEndSession(false);
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
        if (issue.getRemainingEstimateTimeAsString()) {
            return `Der Restaufwand beträgt ${issue.getRemainingEstimateTimeAsString()}. `;
        }
        if (issue.getOriginalEstimatedTimeAsString()) {
            return `${pause(50)}Ursprünglich geschätzt waren ${issue.getOriginalEstimatedTimeAsString()}. `;
        }
        if (!issue.getRemainingEstimateTimeAsString() && !issue.getOriginalEstimatedTimeAsString()) {
            return `Es sind keine Informationen über den Aufwand verfügbar. `;
        }
    }

}
