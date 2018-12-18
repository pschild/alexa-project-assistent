export class SonarQubeMeasure {
    metric: string;
    value: string;
    periods: Array<{index: number; value: string}>;
}
