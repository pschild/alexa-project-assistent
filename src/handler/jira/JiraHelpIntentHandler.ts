import { Inject } from 'typescript-ioc';
import * as alexa from 'alexa-app';
import { sayInEnglish, pause } from '../utils/speechUtils';
import { buildHelpDetailDirective } from '../../apl/datasources';
import AppState from '../../app/state/AppState';

export default class JiraHelpIntentHandler {

    @Inject
    private appState: AppState;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const speech = `Du kannst mich nach Informationen aus ${sayInEnglish('jira')} fragen. Frage zum Beispiel:`
            + `${pause(500)}`
            + `Zeige mir das aktuelle Burn Down Chart!`;

        return response
            .say(speech)
            .reprompt(speech)
            .directive(buildHelpDetailDirective({
                backgroundImageUrl: this.appState.getBaseUrl() + 'static/roehren50l.png',
                imageUrl: this.appState.getBaseUrl() + 'static/jira.png',
                hints: [
                    'Andere den Status von AX-2 auf geschlossen!',
                    'Zeige den Aufwand für das nächste Release!',
                    'Wie ist der Fortschritt im Sprint?',
                    'Zeige mir das aktuelle Burn Down Chart!'
                ]
            }))
            .shouldEndSession(false);
    }
}
