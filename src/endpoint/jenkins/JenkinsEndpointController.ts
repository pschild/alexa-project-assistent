import { EndpointController } from '../EndpointController';
import { get } from 'request-promise';
import { plainToClass } from 'class-transformer';
import { AutoWired, Singleton } from 'typescript-ioc';
import { JenkinsProject } from './domain/JenkinsProject';

@AutoWired
@Singleton
export class JenkinsEndpointController extends EndpointController {

    public config(baseUrl?: string, username?: string, password?: string) {
        return super.config(
            baseUrl || process.env.JENKINS_BASE_URL,
            username || process.env.JENKINS_USERNAME,
            password || process.env.JENKINS_API_TOKEN
        );
    }

    public async getProject(name: string): Promise<JenkinsProject> {
        const jsonResult: JenkinsProject = await get({
            url: `${this.baseUrl}/job/${name}/api/${process.env.JENKINS_FORMAT}`,
            auth: {
                username: this.username,
                password: this.password
            },
            json: true
        });
        return plainToClass(JenkinsProject, jsonResult);
    }
}
