import { Type } from 'class-transformer';
import { JiraIssueFields } from './JiraIssueFields';
import { JiraIssueAssignee } from './JiraIssueAssignee';
import { CF_TEST_COVERAGE } from './constants';
import { IssueStatus, SwimlaneStatus } from './enum';

export class JiraIssue {
    id: string;
    key: string;

    @Type(() => JiraIssueFields)
    fields: JiraIssueFields;

    getAssignee(): JiraIssueAssignee {
        return this.fields.assignee;
    }

    getOriginalEstimateSeconds(): number {
        if (this.fields.timetracking && this.fields.timetracking.originalEstimateSeconds) {
            return this.fields.timetracking.originalEstimateSeconds;
        }
    }

    getRemainingEstimateSeconds(): number {
        if (this.fields.timetracking && this.fields.timetracking.remainingEstimateSeconds) {
            return this.fields.timetracking.remainingEstimateSeconds;
        }
    }

    getTestCoverage() {
        return this.fields[CF_TEST_COVERAGE] ? this.fields[CF_TEST_COVERAGE][0] : null;
    }

    getSwimlaneStatus(): SwimlaneStatus {
        switch (this.fields.status.name) {
            case IssueStatus.OPEN:
            case IssueStatus.REOPENED:
            case IssueStatus.TODO:
                return SwimlaneStatus.TODO;
            case IssueStatus.IN_PROGRESS:
                return SwimlaneStatus.IN_PROGRESS;
            case IssueStatus.CLOSED:
            case IssueStatus.RESOLVED:
                return SwimlaneStatus.DONE;
            default:
                throw new Error(`Unknwon status of jira ticket ${this.key}: ${this.fields.status.name}`);
        }
    }

    getParent(): JiraIssue {
        return this.fields.parent;
    }

    getSubtasks(): JiraIssue[] {
        return this.fields.subtasks;
    }
}
