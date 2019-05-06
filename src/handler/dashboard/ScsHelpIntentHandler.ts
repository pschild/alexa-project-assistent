import { Inject } from 'typescript-ioc';
import * as alexa from 'alexa-app';
import { pause } from '../utils/speechUtils';
import { buildHelpDetailDirective } from '../../apl/datasources';
import AppState from '../../app/state/AppState';

export default class ScsHelpIntentHandler {

    @Inject
    private appState: AppState;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const speech = `Du kannst mich nach systemübergreifenden Informationen fragen. Frage zum Beispiel:`
            + `${pause(500)}`
            + `Zeige das Teilprojekt Dashboard`;

        return response
            .say(speech)
            .reprompt(speech)
            .directive(buildHelpDetailDirective({
                backgroundImageUrl: this.appState.getBaseUrl() + 'static/roehren50l.png',
                imageUrl: this.appState.getBaseUrl() + 'static/heart.png',
                hints: [
                    'Zeige das Teilprojekt Dashboard!',
                    'Wie sehen unsere Systeme aus?'
                ]
            }))
            .shouldEndSession(false);
    }
}
