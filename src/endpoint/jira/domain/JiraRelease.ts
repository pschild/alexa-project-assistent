import { Type } from 'class-transformer';

export class JiraRelease {
    id: string;
    name: string;
    released: boolean;
    projectId: number;

    @Type(() => Date)
    startDate: Date;

    @Type(() => Date)
    releaseDate: Date;
}
