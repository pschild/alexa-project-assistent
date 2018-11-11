import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';

export default async (request: alexa.request, response: alexa.response): Promise<void> => {
    const controller = new JiraEndpointController();
    const result = await controller.getIssue(process.env.TEST_ISSUE_ID);
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
