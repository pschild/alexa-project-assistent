import * as alexa from 'alexa-app';
import * as Speech from 'ssml-builder';
import AppState from '../app/state/AppState';
import { Container } from 'typescript-ioc';
import { wordToXSampaMap } from '../app/appUtils';

export default (request: alexa.request, response: alexa.response): void => {
    const appState: AppState = Container.get(AppState);

    const speech = new Speech();
    if (appState.isFirstStart()) {
        appState.setFirstStart(false);
        speech
            .say(`Hallo und willkommen zum Projekthelferlein.`)
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
    } else {
        speech.say(`Willkommen zurück! Wobei kann ich dir behilflich sein?`);
    }

    const speechOutput = speech.ssml(true);
    response
        .say(speechOutput)
        .reprompt(speechOutput)
        .shouldEndSession(false);
};
