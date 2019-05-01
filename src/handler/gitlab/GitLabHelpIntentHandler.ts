import { Inject } from 'typescript-ioc';
import * as alexa from 'alexa-app';
import { sayInEnglish, pause } from '../../app/speechUtils';
import { buildHelpDetailDirective } from '../../apl/datasources';
import AppState from '../../app/state/AppState';

export default class GitlabHelpIntentHandler {

    @Inject
    private appState: AppState;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const speech = `Du kannst mich nach Informationen aus ${sayInEnglish('gitlab')} fragen. Frage zum Beispiel:`
            + `${pause(500)}`
            + `Zeige Build Status von Projekt Alexa Test`;

        return response
            .say(speech)
            .reprompt(speech)
            .directive(buildHelpDetailDirective({
                imageUrl: this.appState.getBaseUrl() + 'static/gitlab.png',
                hints: [
                    'Zeige alle Buildstatus',
                    'Zeige Buildstatus von Projekt Alexa Test',
                    'Zeige offene Merge Requests'
                ]
            }))
            .shouldEndSession(false);
    }
}
