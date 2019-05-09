import { Inject } from 'typescript-ioc';
import * as alexa from 'alexa-app';
import { buildHelpDetailDirective } from '../../apl/datasources';
import AppState from '../../app/state/AppState';
import { sayInEnglish, pause } from '../utils/speechUtils';
import IIntentHandler from '../IIntentHandler';

export default class GitlabHelpIntentHandler implements IIntentHandler {

    @Inject
    private appState: AppState;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const speech = `Du kannst mich nach Informationen aus ${sayInEnglish('gitlab')} fragen. Frage zum Beispiel:`
            + `${pause(500)}`
            + `Zeige den Build Status von Projekt Auftragsverwaltung`;

        return response
            .say(speech)
            .reprompt(speech)
            .directive(buildHelpDetailDirective({
                backgroundImageUrl: this.appState.getBaseUrl() + 'static/roehren50l.png',
                imageUrl: this.appState.getBaseUrl() + 'static/gitlab.png',
                hints: [
                    'Zeige alle Pipelines!',
                    'Zeige den Buildstatus von Projekt Auftragsverwaltung!',
                    'Wie viele Merge Requests sind offen?'
                ]
            }))
            .shouldEndSession(false);
    }
}
