import * as dotenv from 'dotenv';
import { Container } from 'typescript-ioc';
import { JiraEndpointController } from '../src/endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../src/endpoint/jira/domain/JiraIssue';

dotenv.config();

describe('JiraEndpointController', () => {
    beforeAll(() => {
        this.controller = Container.get(JiraEndpointController);
    });

    it('can load an issue', async () => {
        const issue: JiraIssue = await this.controller.getIssue(process.env.TEST_ISSUE_ID);

        expect(issue.key).toBe(process.env.TEST_ISSUE_ID);
        expect(issue.fields.issuetype.name).toBe('Bug');
        expect(issue.fields.assignee.displayName).toBeDefined();
        expect(issue.getAssignee()).toEqual(issue.fields.assignee);
    });
});
