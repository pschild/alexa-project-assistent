// TODO: move to separate file
export enum TestCoverageStatus {
    FAILED = 'NOK',
    SUCCESSFUL = 'OK',
    NOT_RUN = 'NOTRUN',
    UNCOVERED = 'UNCOVERED'
}

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
