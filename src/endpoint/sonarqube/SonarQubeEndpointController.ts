import { EndpointController } from '../EndpointController';
import { plainToClass } from 'class-transformer';
import { AutoWired, Singleton } from 'typescript-ioc';
import { SonarQubeProjectsResult } from './domain/SonarQubeProjectsResult';
import { SonarQubeMetric } from './domain/SonarQubeMetric';
import { SonarQubeComponent } from './domain/SonarQubeComponent';
import { SonarQubeProject } from './domain/SonarQubeProject';
import { IssueSeverity } from './domain/enum';
import { SonarQubeIssuesResult } from './domain/SonarQubeIssuesResult';
import { SonarQubeQualityGateStatus } from './domain/SonarQubeQualityGateStatus';

@AutoWired
@Singleton
export class SonarQubeEndpointController extends EndpointController {

    public static DEMO_PROJECTS = [
        {name: 'schild:auftragsverwaltung'},
        {name: 'schild:ressourcenverwaltung'},
        {name: 'schild:produktsystem'}
    ];

    public config(baseUrl?: string, token?: string) {
        return super.config(
            baseUrl || process.env.SONARQUBE_BASE_URL,
            token || process.env.SONARQUBE_API_TOKEN
        );
    }

    public async getProjectsByOrganization(organizationName: string): Promise<SonarQubeProjectsResult> {
        const result = await this.get({
            uri: `${this.baseUrl}api/components/search_projects?organization=${organizationName}`
        });
        return plainToClass(SonarQubeProjectsResult, result as SonarQubeProjectsResult);
    }

    public async getProject(projectKey: string): Promise<SonarQubeProject> {
        const result = await this.get({
            uri: `${this.baseUrl}api/components/show?component=${projectKey}`
        });
        return plainToClass(SonarQubeProject, result as SonarQubeProject);
    }

    public async getMetrics(): Promise<SonarQubeMetric[]> {
        const result = await this.get({
            uri: `${this.baseUrl}api/metrics/search`
                + `?ps=500`
        });
        return (result.metrics as SonarQubeMetric[]).map((metric) => plainToClass(SonarQubeMetric, metric));
    }

    public async getQualityGateStatusOfProject(projectKey: string): Promise<SonarQubeQualityGateStatus> {
        const result = await this.get({
            uri: `${this.baseUrl}api/qualitygates/project_status?projectKey=${projectKey}`
        });
        return plainToClass(SonarQubeQualityGateStatus, result.projectStatus as SonarQubeQualityGateStatus);
    }

    public async getMeasuresOfProject(projectKey: string): Promise<SonarQubeComponent> {
        const encodedKey = encodeURIComponent(projectKey);
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
                + `?component=${encodedKey}`
                + `&metricKeys=${metricKeys.join(',')}`
        });
        return plainToClass(SonarQubeComponent, result.component as SonarQubeComponent);
    }

    public async getOpenIssuesOfProject(projectKey: string): Promise<SonarQubeIssuesResult> {
        const encodedKey = encodeURIComponent(projectKey);
        const severities = [
            IssueSeverity.MINOR,
            IssueSeverity.MAJOR,
            IssueSeverity.BLOCKER,
            IssueSeverity.CRITICAL
        ];
        const result = await this.get({
            uri: `${this.baseUrl}api/issues/search`
                + `?componentKeys=${encodedKey}`
                + `&severities=${severities.join(',')}`
                + `&statuses=OPEN`
                + `&ps=500`
        });
        return plainToClass(SonarQubeIssuesResult, result as SonarQubeIssuesResult);
    }
}
