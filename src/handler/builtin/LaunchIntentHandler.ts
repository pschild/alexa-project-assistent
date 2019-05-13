import { Inject } from 'typescript-ioc';
import * as alexa from 'alexa-app';
import AppState from '../../app/state/AppState';
import { buildHomeScreenDirective } from '../../apl/datasources';
import { sayInEnglish } from '../utils/speechUtils';
import IIntentHandler from '../IIntentHandler';

export default class LaunchIntentHandler implements IIntentHandler {

    @Inject
    private appState: AppState;

    private randomCommands: string[] = [
        'Wie viele Merge Requests sind offen?',
        'Wann ist das nächste Release?',
        'Zeige mir das aktuelle Burn Down Chart!',
        'Zeige das SonarQube Dashboard!'
    ];

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        let speech: string;
        if (this.appState.isFirstStart()) {
            this.appState.setFirstStart(false);
            speech = `Hallo und willkommen. Ich bin hier, um dir Informationen zum Projekt zu geben. `
                + `Du kannst mir Fragen zu ${sayInEnglish('jira')}, ${sayInEnglish('gitlab')} oder ${sayInEnglish('sonarcube')} stellen `
                + `oder dir einen allgemeinen Health Check anzeigen lassen. `
                + `Wenn du mal nicht weiter weißt, sage jederzeit: Hilfe. `
                + `Hier noch ein Tipp: Du kannst auch die Touchfunktion des Bildschirms nutzen. `
                + `Was möchtest du wissen? `;
        } else {
            speech = `Freut mich, dich wiederzusehen! Wobei kann ich dir behilflich sein?`;
        }

        return response
            .say(speech)
            .reprompt(`Wie kann ich dir weiterhelfen? Wenn du dir nicht sicher bist, sage: Hilfe.`)
            .directive(buildHomeScreenDirective({
                backgroundImageUrl: this.appState.getBaseUrl() + 'static/birnen70.png',
                logoUrl: this.appState.getBaseUrl() + 'static/logo.png',
                randomCommand: this.randomCommands[Math.floor(Math.random() * this.randomCommands.length)]
            }))
            .shouldEndSession(false);
    }
}
