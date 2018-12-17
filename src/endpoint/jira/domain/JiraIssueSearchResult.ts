import { JiraIssue } from './JiraIssue';
import { Type } from 'class-transformer';

export class JiraIssueSearchResult {
    total: number;

    @Type(() => JiraIssue)
    issues: JiraIssue[];
}
