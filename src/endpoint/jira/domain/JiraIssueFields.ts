import { JiraIssueAssignee } from './JiraIssueAssignee';
import { Type } from 'class-transformer';
import { JiraIssueTimetracking } from './JiraIssueTimetracking';
import { JiraIssueTestCoverage } from './JiraIssueTestCoverage';
import { CF_TEST_COVERAGE } from './constants';
import { IssueType, IssueStatus, IssuePriority } from './enum';
import { JiraIssue } from './JiraIssue';

export class JiraIssueFields {
    issuetype: {id: string, name: IssueType};
    priority: {iconUrl: string, name: IssuePriority, id: string};
    summary: string;

    @Type(() => JiraIssueAssignee)
    assignee: JiraIssueAssignee;

    status: {id: string, name: IssueStatus, iconUrl: string};

    @Type(() => JiraIssueTimetracking)
    timetracking: JiraIssueTimetracking;

    labels: string[];

    @Type(() => JiraIssueTestCoverage)
    [CF_TEST_COVERAGE]: JiraIssueTestCoverage[];

    @Type(() => JiraIssue)
    parent: JiraIssue;

    @Type(() => JiraIssue)
    subtasks: JiraIssue[];
}
