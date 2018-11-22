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
                },
                timetracking: {
                    originalEstimate: '1d',
                    remainingEstimate: '4h',
                    originalEstimateSeconds: 29000,
                    remainingEstimateSeconds: 14400
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
        expect(issue.getOriginalEstimatedTimeAsString()).toEqual('8 Stunden, 3 Minuten und 20 Sekunden');
        expect(issue.getRemainingEstimateTimeAsString()).toEqual('4 Stunden');
    });
});
