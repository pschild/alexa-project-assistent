import { Type } from 'class-transformer';
import { SonarQubeIssue } from './SonarQubeIssue';

export class SonarQubeIssuesResult {
    total: number;
    effortTotal: number;
    debtTotal: number;

    @Type(() => SonarQubeIssue)
    issues: SonarQubeIssue[];
}
