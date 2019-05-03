import { Inject } from 'typescript-ioc';
import * as alexa from 'alexa-app';
import AppState from '../../app/state/AppState';
import { sayInEnglish } from '../../app/speechUtils';
import { buildHomeScreenDirective } from '../../apl/datasources';

export default class LaunchIntentHandler {

    @Inject
    private appState: AppState;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        let speech: string;
        if (this.appState.isFirstStart()) {
            this.appState.setFirstStart(false);
            // speech = `Hallo und willkommen. Du kannst mir Fragen zu folgenden Systemen stellen: `
            //     + `${sayInEnglish('jira')}, ${sayInEnglish('confluence')}, ${sayInEnglish('gitlab')} und ${sayInEnglish('sonarcube')}. `
            //     + `Um die allgemeine Hilfe zu öffnen, sage: Hilfe. `
            //     + `Für eine detaillierte Hilfe, sage zum Beispiel Hilfe für ${sayInEnglish('jira')}. `;
            speech = 'Was tun?';
        } else {
            speech = `Willkommen zurück! Wobei kann ich dir behilflich sein?`;
        }

        return response
            .say(speech)
            .reprompt(`Wie kann ich dir weiterhelfen? Wenn du dir nicht sicher bist, sage: Hilfe.`)
            .directive(buildHomeScreenDirective({
                backgroundImageUrl: this.appState.getBaseUrl() + 'static/birnen70.png',
                logoUrl: this.appState.getBaseUrl() + 'static/logo.png',
                randomCommand: 'test'
            }))
            .shouldEndSession(false);
    }
}
