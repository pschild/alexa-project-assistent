import { JiraIssueAssignee } from './JiraIssueAssignee';
import { Type } from 'class-transformer';
import { JiraIssueStatus } from './JiraIssueStatus';
import { JiraIssueTimetracking } from './JiraIssueTimetracking';

// TODO: move to separate file
export enum IssueType {
    BUG = 'Bug'
}

export class JiraIssueFields {
    issuetype: {id: string, name: IssueType};

    @Type(() => JiraIssueAssignee)
    assignee: JiraIssueAssignee;

    @Type(() => JiraIssueStatus)
    status: JiraIssueStatus;

    @Type(() => JiraIssueTimetracking)
    timetracking: JiraIssueTimetracking;
}
