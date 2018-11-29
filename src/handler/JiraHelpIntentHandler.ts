import * as alexa from 'alexa-app';
import * as Speech from 'ssml-builder';
import { wordToXSampaMap } from '../app/appUtils';

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
            word: '8271'
        });

    const speechOutput = speech.ssml(true);
    response
        .say(speechOutput)
        .reprompt(speechOutput)
        .shouldEndSession(false);
};
