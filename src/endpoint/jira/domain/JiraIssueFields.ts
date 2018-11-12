import { JiraIssueAssignee } from './JiraIssueAssignee';
import { Type } from 'class-transformer';

export enum IssueType {
    BUG = 'Bug'
}

export class JiraIssueFields {
    issuetype: {id: string, name: IssueType};

    @Type(() => JiraIssueAssignee)
    assignee: JiraIssueAssignee;
}
