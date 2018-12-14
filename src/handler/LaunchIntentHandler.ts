import * as alexa from 'alexa-app';
import AppState from '../app/state/AppState';
import { Container } from 'typescript-ioc';
import { sayInEnglish } from '../app/speechUtils';

export default (request: alexa.request, response: alexa.response): void => {
    const appState: AppState = Container.get(AppState);

    let speech: string;
    if (appState.isFirstStart()) {
        appState.setFirstStart(false);
        speech = `Hallo und willkommen. Du kannst mir Fragen zu folgenden Systemen stellen: `
            + `${sayInEnglish('jira')}, ${sayInEnglish('confluence')}, ${sayInEnglish('gitlab')} und ${sayInEnglish('sonarcube')}.`;
    } else {
        speech = `Willkommen zurück! Wobei kann ich dir behilflich sein?`;
    }

    response
        .say(speech)
        .reprompt(speech)
        .shouldEndSession(false);
};
