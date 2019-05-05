import { IssueSeverity, IssueRuleType } from './enum';

export class SonarQubeIssue {
    severity: IssueSeverity;
    component: string;
    status: string;
    effort: string;
    debt: string;
    type: IssueRuleType;
}
