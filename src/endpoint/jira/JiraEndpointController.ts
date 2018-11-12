import { EndpointController } from '../EndpointController';
import { get } from 'request-promise';
import { plainToClass } from 'class-transformer';
import { JiraIssue } from './domain/JiraIssue';
import { AutoWired, Singleton } from 'typescript-ioc';

@AutoWired
@Singleton
export class JiraEndpointController extends EndpointController {

    public static API_VERSION: number = 2;

    constructor(baseUrl?: string, username?: string, password?: string) {
        super(
            baseUrl || process.env.JIRA_BASE_URL,
            username || process.env.JIRA_USERNAME,
            password || process.env.JIRA_PASSWORD
        );
    }

    public async getIssue(identifier: string): Promise<JiraIssue> {
        const jsonResult: JiraIssue = await get({
            // url: 'https://jsonplaceholder.typicode.com/todos/2',
            url: `${this.baseUrl}/rest/api/${JiraEndpointController.API_VERSION}/issue/${identifier}`,
            auth: {
                username: this.username,
                password: this.password
            },
            json: true
        });
        return plainToClass(JiraIssue, jsonResult);
    }
}
