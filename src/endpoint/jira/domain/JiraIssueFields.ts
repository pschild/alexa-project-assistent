import { JiraIssueAssignee } from './JiraIssueAssignee';
import { Type } from 'class-transformer';

export class JiraIssueFields {
    issuetype: {id: string, name: string};

    @Type(() => JiraIssueAssignee)
    assignee: JiraIssueAssignee;
}
