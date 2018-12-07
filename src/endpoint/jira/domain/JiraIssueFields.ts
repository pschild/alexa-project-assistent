import { JiraIssueAssignee } from './JiraIssueAssignee';
import { Type } from 'class-transformer';
import { JiraIssueTimetracking } from './JiraIssueTimetracking';
import { JiraIssueTestCoverage } from './JiraIssueTestCoverage';
import { CF_TEST_COVERAGE } from './constants';

// TODO: move to separate file
export enum IssueType {
    BUG = 'Bug',
    TASK = 'Aufgabe',
    SUBTASK = 'Unteraufgabe',
    STORY = 'Story',
    EPIC = 'Epic',
    IMPROVEMENT = 'Verbesserung'
}

// TODO: move to separate file
export enum IssueStatus {
    OPEN = 'Offen',
    NEW = 'Neu',
    CLOSED = 'Geschlossen',
    DONE = 'Erledigt',
    IN_PROGRESS = 'In Arbeit',
    FINISHED = 'Fertig',
    REOPENED = 'Erneut geöffnet'
}

export class JiraIssueFields {
    issuetype: {id: string, name: IssueType};
    summary: string;

    @Type(() => JiraIssueAssignee)
    assignee: JiraIssueAssignee;

    status: {id: string, name: IssueStatus, iconUrl: string};

    @Type(() => JiraIssueTimetracking)
    timetracking: JiraIssueTimetracking;

    // @Type(() => String)
    labels: string[];

    @Type(() => JiraIssueTestCoverage)
    [CF_TEST_COVERAGE]: JiraIssueTestCoverage[];
}
