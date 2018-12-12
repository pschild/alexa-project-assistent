import { Container } from 'typescript-ioc';
import { JiraEndpointController } from '../../src/endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../../src/endpoint/jira/domain/JiraIssue';
import { IssueType, IssueStatus, TestCoverageStatus } from '../../src/endpoint/jira/domain/enum';

// tslint:disable-next-line:no-var-requires
const mockIssue = require('@mockData/jira/issue.json');

describe('JiraEndpointController', () => {
    beforeAll(() => {
        this.controller = Container.get(JiraEndpointController);

        // mock backend response
        spyOn(this.controller, 'get').and.returnValue(mockIssue);
    });

    it('can load an issue', async () => {
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
