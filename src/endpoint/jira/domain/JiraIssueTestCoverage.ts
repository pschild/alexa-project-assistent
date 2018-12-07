import { TestCoverageStatus } from './enum';

export class JiraIssueTestCoverage {
    status: TestCoverageStatus;
    ok: number;
    okPercent: number;
    nok: number;
    nokPercent: number;
    notrun: number;
    notrunPercent: number;
    unknown: number;
    unknownPercent: number;

    getTestsSum(): number {
        return this.ok + this.nok + this.notrun + this.unknown;
    }
}
