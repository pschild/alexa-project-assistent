import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../endpoint/jira/domain/JiraIssue';
import { Container } from 'typescript-ioc';

export default async (request: alexa.request, response: alexa.response): Promise<void> => {
    const controller = Container.get(JiraEndpointController);
    const issue: JiraIssue = await controller.getIssue(process.env.TEST_ISSUE_ID);

    response
        .directive({
            type: 'Display.RenderTemplate',
            template: {
                type: 'BodyTemplate1',
                backButton: 'HIDDEN',
                backgroundImage: {
                    contentDescription: '',
                    sources: [{
                        url: issue.getAssignee().avatarUrls['48x48'],
                        size: 'LARGE'
                    }]
                },
                textContent: {
                    primaryText: {
                        text: `<div align='center'>${issue.getAssignee().displayName}</div>`,
                        type: 'RichText'
                    }
                }
            }
        })
        .say(`Das Ticket ${process.env.TEST_ISSUE_ID} ist ${issue.getAssignee().displayName} zugewiesen.`);
};
