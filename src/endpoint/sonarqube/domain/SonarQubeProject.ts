import { Type } from 'class-transformer';

export class SonarQubeProject {
    key: string;
    name: string;
    version: string;

    @Type(() => Date)
    analysisDate: Date;
}
