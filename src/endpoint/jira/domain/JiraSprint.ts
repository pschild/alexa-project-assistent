import { SprintStatus } from './enum';
import { Type } from 'class-transformer';

export class JiraSprint {
    id: number;
    state: SprintStatus;
    name: string;
    originBoardId: number;
    goal: string;

    @Type(() => Date)
    startDate: Date;

    @Type(() => Date)
    endDate: Date;

    @Type(() => Date)
    completeDate: Date;
}
