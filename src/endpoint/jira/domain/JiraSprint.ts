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

    getSprintNumber(): number {
        const matches = this.name.match(/(\d+)/);
        if (matches) {
            return +matches[0];
        }
    }

    getPassedHours(): number {
        const now = new Date().getTime();
        const startTime = this.startDate.getTime();
        return (now - startTime) / (1000 * 60 * 60);
    }

    getRemainingHours(): number {
        const now = new Date().getTime();
        const endTime = this.endDate.getTime();
        return (endTime - now) / (1000 * 60 * 60);
    }

    getDurationHours(): number {
        const startTime = this.startDate.getTime();
        const endTime = this.endDate.getTime();
        return (endTime - startTime) / (1000 * 60 * 60);
    }

    getProgress(): number {
        return this.getPassedHours() / this.getDurationHours();
    }
}
