import * as alexa from 'alexa-app';
import * as Speech from 'ssml-builder';
import { wordToXSampaMap } from '../app/appUtils';

export default (request: alexa.request, response: alexa.response): void => {
    const speech = new Speech()
        .say(`Du kannst mir Fragen zu folgenden Systemen stellen: `)
        .phoneme('x-sampa', wordToXSampaMap.get('jira'), 'Jira, ')
        .pause('50ms')
        .phoneme('x-sampa', wordToXSampaMap.get('confluence'), 'Confluence, ')
        .pause('50ms')
        .phoneme('x-sampa', wordToXSampaMap.get('sonarqube'), 'Sonar Qube, ')
        .pause('50ms')
        .phoneme('x-sampa', wordToXSampaMap.get('jenkins'), 'Jenkins')
        .say(`und`)
        .phoneme('x-sampa', wordToXSampaMap.get('gitlab'), 'Gitlab');

    const speechOutput = speech.ssml(true);

    response
        .say(speechOutput)
        .reprompt(speechOutput)
        .shouldEndSession(false);
};
