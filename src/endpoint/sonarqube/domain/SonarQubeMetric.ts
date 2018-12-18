import { MetricType } from './enum';

export class SonarQubeMetric {
    id: string;
    key: string;
    type: MetricType;
    name: string;
    description: string;
    domain: string;
    direction: number;
    qualitative: boolean;
    hidden: boolean;
    custom: boolean;
}
