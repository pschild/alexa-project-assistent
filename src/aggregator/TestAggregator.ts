import { Inject } from 'typescript-ioc';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { JiraIssueSearchResult } from '../endpoint/jira/domain/JiraIssueSearchResult';
import { JiraSprint } from '../endpoint/jira/domain/JiraSprint';
import { JiraIssue } from '../endpoint/jira/domain/JiraIssue';
import { IssueType, SwimlaneStatus } from '../endpoint/jira/domain/enum';

export class TestAggregator {

    @Inject
    private jiraEndpointController: JiraEndpointController;

    public async tooManyOpenIssues(): Promise<any> {
        const currentSprint: JiraSprint = await this.jiraEndpointController.getCurrentSprint();
        const sprintIssues: JiraIssueSearchResult = await this.jiraEndpointController.getIssuesOfSprint(currentSprint.id);

        const passedHours = currentSprint.getPassedHours();
        const remainingHours = currentSprint.getRemainingHours();

        const issues = sprintIssues.issues.filter((issue: JiraIssue) => {
            return issue.fields.issuetype.name !== IssueType.EPIC && issue.fields.issuetype.name !== IssueType.STORY;
        });

        const todoIssues = issues.filter((issue: JiraIssue) => issue.getSwimlaneStatus() === SwimlaneStatus.TODO);
        const doingIssues = issues.filter((issue: JiraIssue) => issue.getSwimlaneStatus() === SwimlaneStatus.IN_PROGRESS);
        const doneIssues = issues.filter((issue: JiraIssue) => issue.getSwimlaneStatus() === SwimlaneStatus.DONE);

        const overallBugs = issues.filter((issue: JiraIssue) => issue.fields.issuetype.name === IssueType.BUG);
        const todoBugs = todoIssues.filter((issue: JiraIssue) => issue.fields.issuetype.name === IssueType.BUG);

        const doneIssesPerHour = doneIssues.length / passedHours;
        const todoAndDoingIssuesPerHour = (doingIssues.length + todoIssues.length) / remainingHours;

        const sumOfRemainingSeconds = issues
            .map((issue: JiraIssue) => issue.getRemainingEstimateSeconds() || 0)
            .reduce((accumulator, currentValue) => accumulator + currentValue);

        return {
            remainingHours,
            todoBugs: todoBugs.length,
            todoAndDoingIssues: doingIssues.length + doneIssues.length,
            doneIssesPerHour,
            todoAndDoingIssuesPerHour,
            sumOfRemainingSeconds
        };
    }
}
