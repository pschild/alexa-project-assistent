import * as dotenv from 'dotenv';
import { Inject } from 'typescript-ioc';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../endpoint/jira/domain/JiraIssue';
import { JenkinsEndpointController } from '../endpoint/jenkins/JenkinsEndpointController';
import { JenkinsProject, Color } from '../endpoint/jenkins/domain/JenkinsProject';
import { IssueType } from '../endpoint/jira/domain/JiraIssueFields';

dotenv.config();

export class TestAggregator {
    @Inject
    private jiraEndpointController: JiraEndpointController;

    @Inject
    private jenkinsEndpointController: JenkinsEndpointController;

    public async test() {
        const issue: JiraIssue = await this.jiraEndpointController.getIssue(process.env.TEST_ISSUE_ID);
        const project: JenkinsProject = await this.jenkinsEndpointController.getProject(process.env.JENKINS_PROJECT);

        if (issue.fields.issuetype.name === IssueType.BUG && project.color === Color.ABORTED) {
            console.log('do something');
        }
    }
}
