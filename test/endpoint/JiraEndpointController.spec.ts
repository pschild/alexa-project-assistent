import { Container } from 'typescript-ioc';
import { JiraEndpointController } from '../../src/endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../../src/endpoint/jira/domain/JiraIssue';
import { IssueType } from '../../src/endpoint/jira/domain/JiraIssueFields';

describe('JiraEndpointController', () => {
    beforeAll(() => {
        this.controller = Container.get(JiraEndpointController);

        // mock backend response
        spyOn(this.controller, 'get').and.returnValue({
            id: '1234',
            key: 'FOO-42',
            fields: {
                issuetype: {
                    id: '456',
                    name: 'Bug'
                },
                assignee: {
                    displayName: 'Doe, John'
                }
            }
        });
    });

    it('can load an issue', async () => {
        const issue: JiraIssue = await this.controller.getIssue('FOO-42');

        expect(issue.key).toBe('FOO-42');
        expect(issue.fields.issuetype.name).toBe(IssueType.BUG);
        expect(issue.fields.assignee.displayName).toBeDefined();
        expect(issue.getAssignee()).toEqual(issue.fields.assignee);
    });
});
