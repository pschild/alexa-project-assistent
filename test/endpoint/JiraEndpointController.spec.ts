import { Container } from 'typescript-ioc';
import { JiraEndpointController } from '../../src/endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../../src/endpoint/jira/domain/JiraIssue';
import { IssueType, IssueStatus } from '../../src/endpoint/jira/domain/JiraIssueFields';
import { TestCoverageStatus } from '../../src/endpoint/jira/domain/JiraIssueTestCoverage';

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
                status: {
                    description: 'The issue is open and ready for the assignee to start work on it.',
                    iconUrl: 'https://example.com/jira/open.png',
                    name: 'Offen',
                    id: '1'
                },
                timetracking: {
                    originalEstimate: '1d',
                    remainingEstimate: '4h',
                    originalEstimateSeconds: 29000,
                    remainingEstimateSeconds: 14400
                },
                labels: ['Tag1', 'Tag2', 'Tag3'],
                customfield_10603: [
                    {
                        issueKey: 'BAR-12',
                        status: 'NOK',
                        statusStyle: 'nok',
                        ok: 5,
                        okPercent: 23.81,
                        okJql: 'issueKey in (BAZ-930, BAZ-931, BAZ-932, BAZ-937, BAZ-264)',
                        nok: 9,
                        nokPercent: 42.86,
                        nokJql: 'issueKey in (BAZ-929, BAZ-933, BAZ-934, BAZ-935, BAZ-173, BAZ-1096, BAZ-263, BAZ-927, BAZ-928)',
                        notrun: 7,
                        notrunPercent: 33.33,
                        notRunJql: 'issueKey in (BAZ-154, BAZ-155, BAZ-936, BAZ-174, BAZ-156, BAZ-157, BAZ-158)',
                        unknown: 0,
                        unknownPercent: 0,
                        unknownJql: 'issueKey in ()'
                    }
                ]
            }
        });
    });

    fit('can load an issue', async () => {
        const issue: JiraIssue = await this.controller.getIssue('FOO-42');

        expect(issue.key).toBe('FOO-42');
        expect(issue.fields.issuetype.name).toBe(IssueType.BUG);

        expect(issue.fields.assignee.displayName).toBeDefined();
        expect(issue.getAssignee()).toEqual(issue.fields.assignee);

        expect(issue.fields.status.name).toBe(IssueStatus.OPEN);

        expect(issue.getOriginalEstimatedTimeAsString()).toEqual('8 Stunden, 3 Minuten und 20 Sekunden');
        expect(issue.getRemainingEstimateTimeAsString()).toEqual('4 Stunden');

        expect(issue.fields.labels).toEqual(['Tag1', 'Tag2', 'Tag3']);

        expect(issue.getTestCoverage()).toBeDefined();
        expect(issue.getTestCoverage().status).toBe(TestCoverageStatus.FAILED);
        expect(issue.getTestCoverage().ok).toBe(5);
        expect(issue.getTestCoverage().okPercent).toBe(23.81);
        expect(issue.getTestCoverage().getTestsSum()).toBe(5 + 9 + 7 + 0);
    });
});
