import { Inject } from 'typescript-ioc';
import * as alexa from 'alexa-app';
import { sayJiraTicket, sayInEnglish, pause } from '../../app/speechUtils';
import { buildHelpDetailDirective } from '../../apl/datasources';
import AppState from '../../app/state/AppState';

export default class JiraHelpIntentHandler {

    @Inject
    private appState: AppState;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const speech = `Du kannst mich nach Informationen aus ${sayInEnglish('jira')} Tickets fragen. Frage zum Beispiel:`
            + `${pause(500)}`
            + `Gib mir eine Zusammenfassung von Ticket ${sayJiraTicket('MDK', '2871')}`;

        return response
            .say(speech)
            .reprompt(speech)
            .directive(buildHelpDetailDirective({
                imageUrl: this.appState.getBaseUrl() + 'static/jira.png',
                hints: [
                    'ändere den status von {JiraTicketIdentifier} {JiraTicketNumber} auf {JiraIssueStatus}',
                    'zeige den aufwand für das nächste release',
                    'zeige den sprint fortschritt'
                ]
            }))
            .shouldEndSession(false);
    }
}
