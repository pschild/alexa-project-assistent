import { Type } from 'class-transformer';
import { SonarQubeMeasure } from './SonarQubeMeasure';

export class SonarQubeComponent {
    id: string;
    key: string;
    name: string;
    qualifier: string;

    @Type(() => SonarQubeMeasure)
    measures: SonarQubeMeasure[];
}
