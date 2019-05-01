import * as alexa from 'alexa-app';
import { sayInEnglish } from '../../app/speechUtils';
import { buildHelpDirective } from '../../apl/datasources';
import { Inject } from 'typescript-ioc';
import AppState from '../../app/state/AppState';

export default class HelpIntentHandler {

    @Inject
    private appState: AppState;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const speech = `Du kannst mir Fragen zu folgenden Systemen stellen: `
            + `${sayInEnglish('jira')}, ${sayInEnglish('gitlab')} und ${sayInEnglish('sonarcube')}.`;

        return response
            .say(speech)
            .reprompt(speech)
            .directive(buildHelpDirective({
                items: [
                    {
                        title: 'Jira',
                        identifier: 'jira',
                        hints: ['Tickets bearbeiten', 'Burndowncharts anzeigen', '...'],
                        imageUrl: this.appState.getBaseUrl() + 'static/jira.png'
                    },
                    {
                        title: 'Gitlab',
                        identifier: 'gitlab',
                        hints: ['Mergerequests', 'Buildstatus', '...'],
                        imageUrl: this.appState.getBaseUrl() + 'static/gitlab.png'
                    },
                    {
                        title: 'SonarQube',
                        identifier: 'sonarqube',
                        hints: ['Qualität', '...'],
                        imageUrl: this.appState.getBaseUrl() + 'static/sonarqube.png'
                    }
                ]
            }))
            .shouldEndSession(false);
    }
}
