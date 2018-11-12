import { EndpointController } from '../EndpointController';
import { plainToClass } from 'class-transformer';
import { JiraIssue } from './domain/JiraIssue';
import { AutoWired, Singleton } from 'typescript-ioc';

@AutoWired
@Singleton
export class JiraEndpointController extends EndpointController {

    public static API_VERSION: number = 2;

    public config(baseUrl?: string, username?: string, password?: string) {
        return super.config(
            baseUrl || process.env.JIRA_BASE_URL,
            username || process.env.JIRA_USERNAME,
            password || process.env.JIRA_PASSWORD
        );
    }

    public async getIssue(identifier: string): Promise<JiraIssue> {
        const result = await this.get({
            uri: `${this.baseUrl}/rest/api/${JiraEndpointController.API_VERSION}/issue/${identifier}`
        });
        return plainToClass(JiraIssue, result as JiraIssue);
    }
}
