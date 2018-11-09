import * as dotenv from 'dotenv';
import * as express from 'express';
import * as alexa from 'alexa-app';
import { get } from 'request-promise';

dotenv.config();

const app = express();

const alexaApp = new alexa.app(process.env.ALEXA_SKILL_NAME);

alexaApp.express({
    expressApp: app,
    checkCert: true,
    debug: true
});

alexaApp.launch((request, response) => {
    response.say(`Hallo. Das ist ein Test. Wie geht es dir?`).shouldEndSession(false);
});

alexaApp.intent('AMAZON.HelpIntent', (request, response) => {
    response.say(`Das ist ein Hilfe-Text`).shouldEndSession(false);
});

alexaApp.intent('AMAZON.StopIntent', (request, response) => {
    response.say(`Auf Wiedersehen!`);
});

alexaApp.intent('HelloWorldIntent', (request, response) => {
    response.say('Triggered HelloWorldIntent');
});

alexaApp.intent('DisplayTestIntent', (request, response) => {
    response
        .directive({
            type: 'Display.RenderTemplate',
            template: {
                type: 'BodyTemplate1',
                backButton: 'HIDDEN',
                backgroundImage: {
                    contentDescription: '',
                    sources: [{
                        url: 'https://www.pschild.de/projects.jpg',
                        size: 'LARGE'
                    }]
                },
                textContent: {
                    primaryText: {
                        text: '<div align="center">centered</div>',
                        type: 'RichText'
                    },
                    secondaryText: {
                        text: '<action token=\'VALUE\'>clickable text</action>',
                        type: 'RichText'
                    }
                }
            }
        })
        .say('Triggered DisplayTestIntent');
});

// 'starte informationsaggregator und öffne jira ticket'
alexaApp.intent('JiraIssueIntent', async (request, response) => {
    const result = await get({
        // url: 'https://jsonplaceholder.typicode.com/todos/2',
        url: `${process.env.JIRA_URL}/rest/api/2/issue/${process.env.TEST_ISSUE_ID}`,
        auth: {
            username: process.env.JIRA_USERNAME,
            password: process.env.JIRA_PASSWORD
        },
        json: true
    });
    const assignee = {
        name: result.fields.assignee.displayName,
        avatar: result.fields.assignee.avatarUrls['48x48']
    };
    response
        .directive({
            type: 'Display.RenderTemplate',
            template: {
                type: 'BodyTemplate1',
                backButton: 'HIDDEN',
                backgroundImage: {
                    contentDescription: '',
                    sources: [{
                        url: assignee.avatar,
                        size: 'LARGE'
                    }]
                },
                textContent: {
                    primaryText: {
                        text: `<div align='center'>${assignee.name}</div>`,
                        type: 'RichText'
                    }
                }
            }
        })
        .say(`Das Ticket ${process.env.TEST_ISSUE_ID} ist ${assignee.name} zugewiesen.`);
});

app.listen(process.env.ALEXA_APP_PORT, () => console.log('Listening on port ' + process.env.ALEXA_APP_PORT + '.'));
