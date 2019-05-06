import { Inject } from 'typescript-ioc';
import * as alexa from 'alexa-app';
import { sayJiraTicket, sayInEnglish, pause } from '../utils/speechUtils';
import { buildHelpDetailDirective } from '../../apl/datasources';
import AppState from '../../app/state/AppState';

export default class SonarQubeHelpIntentHandler {

    @Inject
    private appState: AppState;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const speech = `Du kannst mich nach Informationen aus ${sayInEnglish('sonarcube')} fragen. Frage zum Beispiel:`
            + `${pause(500)}`
            + `Zeige eine Sonarcube Übersicht von Projekt Auftragsverwaltung`;

        return response
            .say(speech)
            .reprompt(speech)
            .directive(buildHelpDetailDirective({
                backgroundImageUrl: this.appState.getBaseUrl() + 'static/roehren50l.png',
                imageUrl: this.appState.getBaseUrl() + 'static/sonarqube.png',
                hints: [
                    'Zeige SonarQube Dashboard!',
                    'Zeige SonarQube Übersicht von Projekt Auftragsverwaltung!'
                ]
            }))
            .shouldEndSession(false);
    }
}
