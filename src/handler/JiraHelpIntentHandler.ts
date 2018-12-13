import * as alexa from 'alexa-app';
import * as Speech from 'ssml-builder';
import { wordToXSampaMap } from '../app/appUtils';
import { buildTextSamplesDirective } from '../apl/datasources';

export default (request: alexa.request, response: alexa.response): void => {
    const speech = new Speech()
        .say(`Du kannst mich nach Informationen aus `)
        .phoneme('x-sampa', wordToXSampaMap.get('jira'), 'Jira')
        .say(`Tickets fragen. Frage zum Beispiel:`)
        .pause('500ms')
        .say(`Gib mir eine Zusammenfassung von Ticket `)
        .sayAs({
            interpret: 'characters',
            word: 'MDK'
        })
        .pause('50ms')
        .sayAs({
            interpret: 'digits',
            word: '2871'
        });

    const speechOutput = speech.ssml(true);
    response
        .say(speechOutput)
        .reprompt(speechOutput)
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
