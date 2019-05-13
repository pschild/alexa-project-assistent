import * as alexa from 'alexa-app';
import { buildHelpDirective } from '../../apl/datasources';
import { Inject } from 'typescript-ioc';
import AppState from '../../app/state/AppState';
import { sayInEnglish } from '../utils/speechUtils';
import IIntentHandler from '../IIntentHandler';

export default class HelpIntentHandler implements IIntentHandler {

    @Inject
    private appState: AppState;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        let speech;
        if (this.appState.isFirstHelpCall()) {
            this.appState.setFirstHelpCall(false);
            speech = `Du kannst mir Fragen zu den Systemen `
                + `${sayInEnglish('jira')}, ${sayInEnglish('gitlab')} und ${sayInEnglish('sonarcube')} stellen. `
                + `Um eine detaillierte Hilfe zu einem System zu öffnen sage zum Beispiel Hilfe für ${sayInEnglish('jira')}. `
                + `Für einen Health Check der Teilsysteme kann ich dir auch ein Dashboard anzeigen.`;
        } else {
            speech = `Wobei kann ich dir helfen?`;
        }
        const reprompt = `Du kannst auch auf das jeweilige Logo tippen, um Hilfe zu einem System zu erhalten.`;

        return response
            .say(speech)
            .reprompt(reprompt)
            .directive(buildHelpDirective({
                backgroundImageUrl: this.appState.getBaseUrl() + 'static/roehren50l.png',
                items: [
                    {
                        title: 'Jira',
                        identifier: 'jira',
                        hints: ['Status von Tickets ändern', 'Burn Down Charts', 'Sprintfortschritt', '...'],
                        imageUrl: this.appState.getBaseUrl() + 'static/jira.png'
                    },
                    {
                        title: 'Gitlab',
                        identifier: 'gitlab',
                        hints: ['Offene Merge Requests', 'Buildstatus aller Pipelines', '...'],
                        imageUrl: this.appState.getBaseUrl() + 'static/gitlab.png'
                    },
                    {
                        title: 'SonarQube',
                        identifier: 'sonarqube',
                        hints: ['Quality Gate Status', 'Testabdeckung', '...'],
                        imageUrl: this.appState.getBaseUrl() + 'static/sonarqube.png'
                    },
                    {
                        title: 'Health Check',
                        identifier: 'scs',
                        hints: ['Dashboard für Teilsysteme'],
                        imageUrl: this.appState.getBaseUrl() + 'static/heart.png'
                    }
                ]
            }))
            .shouldEndSession(false);
    }
}
