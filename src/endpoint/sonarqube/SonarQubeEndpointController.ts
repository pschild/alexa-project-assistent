import { EndpointController } from '../EndpointController';
import { plainToClass } from 'class-transformer';
import { AutoWired, Singleton } from 'typescript-ioc';
import { SonarQubeProjectsResult } from './domain/SonarQubeProjectsResult';
import { SonarQubeMetric } from './domain/SonarQubeMetric';
import { SonarQubeComponent } from './domain/SonarQubeComponent';

@AutoWired
@Singleton
export class SonarQubeEndpointController extends EndpointController {

    public config(baseUrl?: string, token?: string) {
        return super.config(
            baseUrl || process.env.SONARQUBE_BASE_URL,
            token || process.env.SONARQUBE_API_TOKEN
        );
    }

    public async getProjects(): Promise<SonarQubeProjectsResult> {
        const result = await this.get({
            uri: `${this.baseUrl}api/components/search?qualifiers=TRK`,
            strictSSL: false
        });
        return plainToClass(SonarQubeProjectsResult, result as SonarQubeProjectsResult);
    }

    public async getMetrics(): Promise<SonarQubeMetric[]> {
        const result = await this.get({
            uri: `${this.baseUrl}api/metrics/search`,
            strictSSL: false
        });
        return (result.metrics as SonarQubeMetric[]).map((metric) => plainToClass(SonarQubeMetric, metric));
    }

    public async getMeasuresOfComponent(): Promise<SonarQubeComponent> {
        const componentName = encodeURIComponent('de.mdk.bs.vw:auftrags-verwaltung');
        const metricKeys = [
            'ncloc',
            'complexity',
            'violations',
            'bugs',
            'code_smells',
            'coverage',
            'new_coverage',
            'critical_violations',
            'open_issues',
            'overall_coverage',
            'duplicated_lines_density',
            'new_duplicated_lines_density',
            'new_lines'
        ];
        const result = await this.get({
            uri: `${this.baseUrl}api/measures/component`
                + `?component=${componentName}`
                + `&metricKeys=${metricKeys.join(',')}`,
            strictSSL: false
        });
        return plainToClass(SonarQubeComponent, result.component as SonarQubeComponent);
    }
}
