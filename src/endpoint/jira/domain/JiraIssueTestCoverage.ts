import { TestCoverageStatus } from './enum';

export class JiraIssueTestCoverage {
    status: TestCoverageStatus;
    ok: number;
    okPercent: number;
    okJql: string;
    nok: number;
    nokPercent: number;
    nokJql: string;
    notRun: number;
    notRunPercent: number;
    notRunJql: string;
    unknown: number;
    unknownPercent: number;
    unknownJql: string;

    getTestsSum(): number {
        return this.ok + this.nok + this.notRun + this.unknown;
    }

    getOkTestKeys(): string[] {
        return this.okJql ? this.okJql.match(/([A-Z]+-\d+)/g) || [] : [];
    }

    getNokTestKeys(): string[] {
        return this.nokJql ? this.nokJql.match(/([A-Z]+-\d+)/g) || [] : [];
    }

    getNotRunTestKeys(): string[] {
        return this.notRunJql ? this.notRunJql.match(/([A-Z]+-\d+)/g) || [] : [];
    }

    getUnknownTestKeys(): string[] {
        return this.unknownJql ? this.unknownJql.match(/([A-Z]+-\d+)/g) || [] : [];
    }

    getAllTestKeys(): string[] {
        return [].concat(this.getOkTestKeys(), this.getNokTestKeys(), this.getNotRunTestKeys(), this.getUnknownTestKeys());
    }
}
