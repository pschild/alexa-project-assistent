import { Type } from 'class-transformer';
import { JiraIssueFields } from './JiraIssueFields';
import { JiraIssueAssignee } from './JiraIssueAssignee';

export class JiraIssue {
    id: string;
    key: string;

    @Type(() => JiraIssueFields)
    fields: JiraIssueFields;

    getAssignee(): JiraIssueAssignee {
        return this.fields.assignee;
    }
}
