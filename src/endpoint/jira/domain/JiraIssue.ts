import * as humanizeDuration from 'humanize-duration';
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

    getOriginalEstimatedTimeAsString(): string {
        if (!this.fields.timetracking || !this.fields.timetracking.originalEstimateSeconds) {
            return null;
        }
        return humanizeDuration(this.fields.timetracking.originalEstimateSeconds * 1000, {
            language: 'de',
            conjunction: ' und ',
            serialComma: false
        });
    }

    getRemainingEstimateTimeAsString(): string {
        if (!this.fields.timetracking || !this.fields.timetracking.remainingEstimateSeconds) {
            return null;
        }
        return humanizeDuration(this.fields.timetracking.remainingEstimateSeconds * 1000, {
            language: 'de',
            conjunction: ' und ',
            serialComma: false
        });
    }
}
