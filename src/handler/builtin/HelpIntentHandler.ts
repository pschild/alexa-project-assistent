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
            + `${sayInEnglish('jira')}, ${sayInEnglish('gitlab')} und ${sayInEnglish('sonarcube')}.`
            + `Für eine detaillierte Hilfe zu einem System sage zum Beispiel Hilfe für ${sayInEnglish('jira')}.`;
        const reprompt = `Du kannst auch auf das jeweilige Logo tippen, um Hilfe zu einem System zu erhalten.`;

        return response
            .say(speech)
            .reprompt(reprompt)
            .directive(buildHelpDirective({
                items: [
                    {
                        title: 'Jira',
                        identifier: 'jira',
                        hints: ['Status von Tickets ändern', 'Burn Down Charts generieren', 'Sprintfortschritt anzeigen', '...'],
                        imageUrl: this.appState.getBaseUrl() + 'static/jira.png'
                    },
                    {
                        title: 'Gitlab',
                        identifier: 'gitlab',
                        hints: ['Offene Merge Requests anzeigen', 'Buildstatus aller Projekt-Pipelines anzeigen', '...'],
                        imageUrl: this.appState.getBaseUrl() + 'static/gitlab.png'
                    },
                    {
                        title: 'SonarQube',
                        identifier: 'sonarqube',
                        hints: ['tbd', '...'],
                        imageUrl: this.appState.getBaseUrl() + 'static/sonarqube.png'
                    }
                ]
            }))
            .shouldEndSession(false);
    }
}
