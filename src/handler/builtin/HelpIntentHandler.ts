import * as alexa from 'alexa-app';
import { buildListDirective, buildListItem } from '../../apl/datasources';
import { sayInEnglish } from '../../app/speechUtils';

export default (request: alexa.request, response: alexa.response): void => {
    const speech = `Du kannst mir Fragen zu folgenden Systemen stellen: `
        + `${sayInEnglish('jira')}, ${sayInEnglish('confluence')}, ${sayInEnglish('gitlab')} und ${sayInEnglish('sonarcube')}.`;

    response
        .say(speech)
        .reprompt(speech)
        .directive(buildListDirective({
            title: 'Herzlich Willkommen!',
            logoUrl: 'https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png',
            hintText: 'Versuche "Alexa, öffne die Hilfe für Jira"',
            listItems: [
                buildListItem(
                    'jira',
                    'Jira',
                    'Tickets, Burndowncharts, ...',
                    'https://www.logolynx.com/images/logolynx/af/af63f3e1c0d895db1091f7965f073065.jpeg'
                ),
                buildListItem(
                    'confluence',
                    'Confluence',
                    'Inhalte suchen, ...',
                    'https://www.it-times.de/resources/dam/asset/11395/social_networks.jpg'
                ),
                buildListItem(
                    'gitlab',
                    'Gitlab',
                    'Mergerequests, Buildstatus, ...',
                    'https://sg.fiverrcdn.com/photos/97348831/original/163a9d2ed426f568571f38920fc440b10692f403.jpg?1495520161'
                ),
                buildListItem(
                    'sonarqube',
                    'SonarQube',
                    'Qualität, ...',
                    'https://vijayasankarn.files.wordpress.com/2017/07/sonarqube.jpg?w=600'
                )
            ]
        }))
        .shouldEndSession(false);
};
