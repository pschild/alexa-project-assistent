import * as alexa from 'alexa-app';
import { buildTextSamplesDirective } from '../apl/datasources';
import { jiraTicketSpeech, pronounceEnglish, pause } from '../app/speechUtils';

export default (request: alexa.request, response: alexa.response): void => {
    const speech = `Du kannst mich nach Informationen aus ${pronounceEnglish('jira')} Tickets fragen. Frage zum Beispiel:`
        + `${pause(500)}`
        + `Gib mir eine Zusammenfassung von Ticket ${jiraTicketSpeech('MDK', '2871')}`;

    response
        .say(speech)
        .reprompt(speech)
        .directive(buildTextSamplesDirective({
            title: 'Hilfe für Jira',
            logoUrl: 'https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png',
            textContent: {
                primaryText: {
                    type: 'PlainText',
                    text: `
                        "Öffne Ticket"
                        <br><br>
                        "Öffne Ticket MDK 400"
                        <br><br>
                        "Gib mir eine Zusammenfassung von Ticket MDK 2871"
                    `
                }
            }
        }))
        .shouldEndSession(false);
};
