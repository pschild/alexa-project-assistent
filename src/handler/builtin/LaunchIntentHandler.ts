import * as alexa from 'alexa-app';
import AppState from '../../app/state/AppState';
import { Container } from 'typescript-ioc';
import { sayInEnglish } from '../../app/speechUtils';

export default (request: alexa.request, response: alexa.response): void => {
    const appState: AppState = Container.get(AppState);

    let speech: string;
    speech = 'Was tun?';
    // if (appState.isFirstStart()) {
    //     appState.setFirstStart(false);
    //     speech = `Hallo und willkommen. Du kannst mir Fragen zu folgenden Systemen stellen: `
    //         + `${sayInEnglish('jira')}, ${sayInEnglish('confluence')}, ${sayInEnglish('gitlab')} und ${sayInEnglish('sonarcube')}. `
    //         + `Um die allgemeine Hilfe zu öffnen, sage: Hilfe. `
    //         + `Für eine detaillierte Hilfe, sage zum Beispiel Hilfe für ${sayInEnglish('jira')}. `;
    // } else {
        // speech = `Willkommen zurück! Wobei kann ich dir behilflich sein?`;
    // }

    response
        .say(speech)
        .reprompt(`Wie kann ich dir weiterhelfen? Wenn du dir nicht sicher bist, sage: Hilfe.`)
        .shouldEndSession(false);
};
