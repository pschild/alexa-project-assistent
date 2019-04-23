import { TestRunStatus } from './enum';
import { Type } from 'class-transformer';

export class JiraTestRun {
    id: number;
    status: TestRunStatus;
    testKey: string;
    executedBy: string;

    @Type(() => Date)
    startedOn: Date;

    @Type(() => Date)
    finishedOn: Date;
}
