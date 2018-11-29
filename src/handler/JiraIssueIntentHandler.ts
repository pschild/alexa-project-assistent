import * as alexa from 'alexa-app';
import * as Speech from 'ssml-builder';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../endpoint/jira/domain/JiraIssue';
import { Container } from 'typescript-ioc';

let speech;

export default async (request: alexa.request, response: alexa.response): Promise<alexa.response> => {
    speech = new Speech();
    const session = request.getSession();
    let hasError = false;

    if (!request.getDialog().isCompleted()) {
        const updatedIntent = request.data.request.intent;
        if (!session.get('jiraTicketId') || !session.get('jiraTicketNo')) {
            return response
                .directive({
                    type: 'Dialog.Delegate',
                    updatedIntent
                })
                .shouldEndSession(false);
        }
    }

    const ticketActionValue = request.slot('JiraTicketAction');
    const ticketIdentifierValue = request.slot('JiraTicketIdentifier') || session.get('jiraTicketId');
    const ticketNumberValue = request.slot('JiraTicketNumber') || session.get('jiraTicketNo');
    console.log(ticketActionValue, ticketIdentifierValue, ticketNumberValue);

    const controller: JiraEndpointController = Container.get(JiraEndpointController);
    const issue: JiraIssue = await controller
        .getIssue(`${ticketIdentifierValue}-${ticketNumberValue}`)
        .catch((error) => {
            hasError = true;
            addTicketNotLoadableSpeech(ticketIdentifierValue, ticketNumberValue);
            return null;
        });

    if (!issue && !hasError) {
        hasError = true;
        addTicketNotFoundSpeech(ticketIdentifierValue, ticketNumberValue);
        // TODO: UX: add display directive
    }

    if (hasError) {
        return response.say(speech.ssml(true)).shouldEndSession(false);
    }

    session.set('jiraTicketId', ticketIdentifierValue);
    session.set('jiraTicketNo', ticketNumberValue);

    let outputDirectives = [];

    if (ticketActionValue === 'bearbeiter') {
        addAssigneeSpeech(issue);
        outputDirectives = [...outputDirectives, addAssigneeDisplay(issue)];
    } else if (ticketActionValue === 'titel') {
        addTitleSpeech(issue);
    } else if (ticketActionValue === 'zeit') {
        addEstimationSpeech(issue);
    } else if (ticketActionValue === 'diagramm') {
        const publicScreenshotUrl = controller.getBurndownChartUrl(36, 37);
        if (publicScreenshotUrl) {
            speech.say(`Hier ist das aktuelle Burndown Chart.`);
            outputDirectives = [...outputDirectives, addBurndownChartDisplay(publicScreenshotUrl)];
        } else {
            speech.say(`Ich erstelle das Diagramm. Bitte warte einen Moment und frage mich gleich nochmal.`);
            controller.crawlBurndownChart(36, 37);
            // TODO: add directive to enable the user to show the diagram when clicked a button?!
        }
    } else if (ticketActionValue === 'zusammenfassung') {
        addAssigneeSpeech(issue);
        speech.pause('100ms');
        addTitleSpeech(issue);
        speech.pause('100ms');
        addEstimationSpeech(issue);
        speech.pause('100ms');
    }

    speech
        .pause('100ms')
        .say(`Sonst noch etwas?`);

    outputDirectives.map((d) => response.directive(d));
    response.say(speech.ssml(true)).shouldEndSession(false);
};

const addAssigneeSpeech = (issue: JiraIssue) => {
    const assigneeName = issue.getAssignee() ? issue.getAssignee().getFullName() : 'keinem Mitarbeiter';
    speech
        .say(`Das Ticket`)
        .sayAs({
            interpret: 'characters',
            word: issue.key.replace('-', '')
        })
        .say(`ist ${assigneeName} zugewiesen.`);
};

const addAssigneeDisplay = (issue: JiraIssue): {type: string, template: any} => {
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
};

const addBurndownChartDisplay = (screenshotUrl: string): {type: string, template: any} => {
    return {
        type: 'Display.RenderTemplate',
        template: {
            type: 'BodyTemplate1',
            backButton: 'HIDDEN',
            backgroundImage: {
                contentDescription: '',
                sources: [{
                    url: screenshotUrl,
                    size: 'LARGE'
                }]
            }
        }
    };
};

const addTitleSpeech = (issue: JiraIssue) => {
    speech
        .say(`Die Bezeichnung lautet`)
        .pause('200ms')
        .say(issue.fields.summary);
};

const addEstimationSpeech = (issue: JiraIssue) => {
    if (issue.getRemainingEstimateTimeAsString()) {
        speech.say(`Der Restaufwand beträgt ${issue.getRemainingEstimateTimeAsString()}.`);
    }
    if (issue.getOriginalEstimatedTimeAsString()) {
        speech
            .pause('50ms')
            .say(`Ursprünglich geschätzt waren ${issue.getOriginalEstimatedTimeAsString()}.`);
    }
    if (!issue.getRemainingEstimateTimeAsString() && !issue.getOriginalEstimatedTimeAsString()) {
        speech.say(`Es sind keine Informationen über den Aufwand verfügbar.`);
    }
};

const addTicketNotLoadableSpeech = (ticketIdentifierValue, ticketNumberValue) => {
    speech
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
};

const addTicketNotFoundSpeech = (ticketIdentifierValue, ticketNumberValue) => {
    speech
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
};
