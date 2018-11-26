import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../endpoint/jira/domain/JiraIssue';
import { Container } from 'typescript-ioc';

export default async (request: alexa.request, response: alexa.response): Promise<alexa.response> => {
    const session = request.getSession();
    let errorSpeechOutput;

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
            errorSpeechOutput = `Ich konnte das Ticket ${ticketIdentifierValue}-${ticketNumberValue} nicht finden.`;
            return null;
        });

    // TODO: cleaner error handling
    if (!issue) {
        errorSpeechOutput = `Ich habe Probleme, das Ticket ${ticketIdentifierValue}-${ticketNumberValue} auszuwerten.`;
    }

    if (errorSpeechOutput) {
        return response.say(errorSpeechOutput);
    }

    session.set('jiraTicketId', ticketIdentifierValue);
    session.set('jiraTicketNo', ticketNumberValue);

    let outputSayings = [];
    let outputDirectives = [];

    outputSayings = [...outputSayings, `Ticket ${ticketIdentifierValue}-${ticketNumberValue}.`];

    if (ticketActionValue === 'bearbeiter') {
        outputSayings = [...outputSayings, addAssigneeSpeech(issue)];
        outputDirectives = [...outputDirectives, addAssigneeDisplay(issue)];
    } else if (ticketActionValue === 'titel') {
        outputSayings = [...outputSayings, addTitleSpeech(issue)];
    } else if (ticketActionValue === 'zeit') {
        outputSayings = [...outputSayings, addEstimationSpeech(issue)];
    } else if (ticketActionValue === 'diagramm') {
        const publicScreenshotUrl = controller.getBurndownChartUrl(36, 37);
        if (publicScreenshotUrl) {
            outputSayings = [...outputSayings, `Hier ist das aktuelle Burndown Chart.`];
            outputDirectives = [...outputDirectives, addBurndownChartDisplay(publicScreenshotUrl)];
        } else {
            outputSayings = [...outputSayings, `Ich erstelle das Diagramm. Bitte warte einen Moment und frag mich gleich nochmal.`];
            controller.crawlBurndownChart(36, 37);
            // TODO: add directive to enable the user to show the diagram when clicked a button?!
        }
    } else if (ticketActionValue === 'zusammenfassung') {
        outputSayings = [
            ...outputSayings,
            addAssigneeSpeech(issue),
            addTitleSpeech(issue),
            addEstimationSpeech(issue)
        ];
    }

    outputSayings = [...outputSayings, `Möchtest du noch weitere Infos? Sage zum Beispiel Zusammenfassung oder Diagramm.`];

    outputDirectives.map((d) => response.directive(d));
    response.say(outputSayings.join(' ')).shouldEndSession(false);
};

const addAssigneeSpeech = (issue): string|string[] => {
    const assigneeName = issue.getAssignee() ? issue.getAssignee().getFullName() : 'keinem Mitarbeiter';
    return `Das Ticket ist ${assigneeName} zugewiesen.`;
};

const addAssigneeDisplay = (issue): {type: string, template: any} => {
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

const addTitleSpeech = (issue): string|string[] => `Die Bezeichnung lautet ${issue.fields.summary}.`;

const addEstimationSpeech = (issue): string|string[] => {
    let output = [];
    if (issue.getRemainingEstimateTimeAsString()) {
        output = [...output, `Der Restaufwand beträgt ${issue.getRemainingEstimateTimeAsString()}.`];
    }
    if (issue.getOriginalEstimatedTimeAsString()) {
        output = [...output, `Ursprünglich geschätzt waren ${issue.getOriginalEstimatedTimeAsString()}.`];
    }
    if (!output.length) {
        output = [`Keine Informationen über den Aufwand verfügbar.`];
    }
    return output;
};
