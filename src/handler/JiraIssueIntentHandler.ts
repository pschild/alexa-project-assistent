import * as alexa from 'alexa-app';
import { get } from 'request-promise';

export default async (request: alexa.request, response: alexa.response): Promise<void> => {
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
};
