import { Inject } from 'typescript-ioc';
import * as alexa from 'alexa-app';
import { sayJiraTicket, sayInEnglish, pause } from '../utils/speechUtils';
import { buildHelpDetailDirective } from '../../apl/datasources';
import AppState from '../../app/state/AppState';
import IIntentHandler from '../IIntentHandler';

export default class SonarQubeHelpIntentHandler implements IIntentHandler {

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
                    'Zeige die SonarQube Ansicht!',
                    'Wie ist die Qualität vom Projekt Auftragsverwaltung?'
                ]
            }))
            .shouldEndSession(false);
    }
}
