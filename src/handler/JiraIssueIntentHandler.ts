import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../endpoint/jira/domain/JiraIssue';
import { Inject } from 'typescript-ioc';
import { AbstractIntentHandler } from './AbstractIntentHandler';

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
                this.hasError = true;
                this.addTicketNotLoadableSpeech(ticketIdentifierValue, ticketNumberValue);
                return null;
            });

        if (!issue && !this.hasError) {
            this.hasError = true;
            this.addTicketNotFoundSpeech(ticketIdentifierValue, ticketNumberValue);
            // TODO: UX: add display directive
        }

        if (this.hasError) {
            return response.say(this.speech.ssml(true)).shouldEndSession(false);
        }

        this.session.set('jiraTicketId', ticketIdentifierValue);
        this.session.set('jiraTicketNo', ticketNumberValue);

        if (ticketActionValue === 'bearbeiter') {
            this.addAssigneeSpeech(issue);
            this.addDirective(this.addAssigneeDisplay(issue));
        } else if (ticketActionValue === 'titel') {
            this.addTitleSpeech(issue);
        } else if (ticketActionValue === 'zeit') {
            this.addEstimationSpeech(issue);
        } else if (ticketActionValue === 'zusammenfassung') {
            this.addAssigneeSpeech(issue);
            this.speech.pause('100ms');
            this.addTitleSpeech(issue);
            this.speech.pause('100ms');
            this.addEstimationSpeech(issue);
            this.speech.pause('100ms');
        }

        this.speech
            .pause('100ms')
            .say(`Sonst noch etwas?`);

        this.outputDirectives.map((d) => response.directive(d));
        response.say(this.speech.ssml(true)).shouldEndSession(false);
    }

    private addAssigneeSpeech(issue: JiraIssue) {
        const assigneeName = issue.getAssignee() ? issue.getAssignee().getFullName() : 'keinem Mitarbeiter';
        this.speech
            .say(`Das Ticket`)
            .sayAs({
                interpret: 'characters',
                word: issue.key.replace('-', '')
            })
            .say(`ist ${assigneeName} zugewiesen.`);
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
        this.speech
            .say(`Die Bezeichnung lautet`)
            .pause('200ms')
            .say(issue.fields.summary);
    }

    private addEstimationSpeech(issue: JiraIssue) {
        if (issue.getRemainingEstimateTimeAsString()) {
            this.speech.say(`Der Restaufwand beträgt ${issue.getRemainingEstimateTimeAsString()}.`);
        }
        if (issue.getOriginalEstimatedTimeAsString()) {
            this.speech
                .pause('50ms')
                .say(`Ursprünglich geschätzt waren ${issue.getOriginalEstimatedTimeAsString()}.`);
        }
        if (!issue.getRemainingEstimateTimeAsString() && !issue.getOriginalEstimatedTimeAsString()) {
            this.speech.say(`Es sind keine Informationen über den Aufwand verfügbar.`);
        }
    }

    private addTicketNotLoadableSpeech(ticketIdentifierValue, ticketNumberValue) {
        this.speech
            .say(`Ich konnte das Ticket`)
            .sayAs({
                interpret: 'characters',
                word: ticketIdentifierValue
            })
            .pause('50ms')
            .sayAs({
                interpret: 'digits',
                word: ticketNumberValue
            })
            .say(`nicht laden.`);
    }

    private addTicketNotFoundSpeech(ticketIdentifierValue, ticketNumberValue) {
        this.speech
            .say(`Ich habe Probleme, das Ticket`)
            .sayAs({
                interpret: 'characters',
                word: ticketIdentifierValue
            })
            .pause('50ms')
            .sayAs({
                interpret: 'digits',
                word: ticketNumberValue
            })
            .say(`auszuwerten.`);
    }

}
