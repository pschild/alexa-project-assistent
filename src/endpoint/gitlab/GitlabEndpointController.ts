import { EndpointController } from '../EndpointController';
import { plainToClass } from 'class-transformer';
import { AutoWired, Singleton } from 'typescript-ioc';
import { GitlabProject } from './domain/GitlabProject';
import { GitlabMergeRequest } from './domain/GitlabMergeRequest';
import { MergeRequestState, MergeRequestScope } from './domain/enum';
import { GitlabBranch } from './domain/GitlabBranch';
import { GitlabCommit } from './domain/GitlabCommit';
import { GitlabPipeline } from './domain/GitlabPipeline';

@AutoWired
@Singleton
export class GitlabEndpointController extends EndpointController {

    public static API_VERSION: number = 4;

    public config(baseUrl?: string, authToken?: string) {
        return super.config(
            baseUrl || process.env.GITLAB_BASE_URL,
            undefined,
            undefined,
            {
                'Private-Token': authToken || process.env.GITLAB_API_TOKEN
            }
        );
    }

    public async getProjects(): Promise<GitlabProject[]> {
        const result = await this.get({
            uri: `${this.baseUrl}/api/v${GitlabEndpointController.API_VERSION}/projects`
        });
        return (result as GitlabProject[]).map((project) => plainToClass(GitlabProject, project));
    }

    public async getProject(id: number): Promise<GitlabProject> {
        const result = await this.get({
            uri: `${this.baseUrl}/api/v${GitlabEndpointController.API_VERSION}/projects/${id}`
        });
        return plainToClass(GitlabProject, result as GitlabProject);
    }

    public async getAllOpenMergeRequests(): Promise<GitlabMergeRequest[]> {
        const result = await this.get({
            uri: [
                `${this.baseUrl}/api/v${GitlabEndpointController.API_VERSION}/merge_requests`,
                `?scope=${MergeRequestScope.ALL}`,
                `&state=${MergeRequestState.OPENED}`
            ].join('')
        });
        return (result as GitlabMergeRequest[]).map((mergeRequest) => plainToClass(GitlabMergeRequest, mergeRequest));
    }

    public async getBranchesOfProject(id: number): Promise<GitlabBranch[]> {
        const result = await this.get({
            uri: `${this.baseUrl}/api/v${GitlabEndpointController.API_VERSION}/projects/${id}/repository/branches`
        });
        return (result as GitlabBranch[]).map((branch) => plainToClass(GitlabBranch, branch));
    }

    public async getCommitsOfProject(id: number): Promise<GitlabCommit[]> {
        const result = await this.get({
            uri: `${this.baseUrl}/api/v${GitlabEndpointController.API_VERSION}/projects/${id}/repository/commits`
        });
        return (result as GitlabCommit[]).map((commit) => plainToClass(GitlabCommit, commit));
    }

    public async getPipelinesOfProject(id: number): Promise<GitlabPipeline[]> {
        const result = await this.get({
            uri: `${this.baseUrl}/api/v${GitlabEndpointController.API_VERSION}/projects/${id}/pipelines`
        });
        return (result as GitlabPipeline[]).map((pipeline) => plainToClass(GitlabPipeline, pipeline));
    }

    public async getPipeline(projectId: number, pipelineId: number): Promise<GitlabPipeline> {
        const result = await this.get({
            uri: `${this.baseUrl}/api/v${GitlabEndpointController.API_VERSION}/projects/${projectId}/pipelines/${pipelineId}`
        });
        return plainToClass(GitlabPipeline, result as GitlabPipeline);
    }

    public groupMergeRequestsByAssignee(mergeRequests: GitlabMergeRequest[]) {
        const result = {};
        mergeRequests.forEach((mergeRequest: GitlabMergeRequest) => {
            const key = mergeRequest.assignee.name;
            if (result[key] && result[key].length) {
                result[key].push(mergeRequest);
            } else {
                result[key] = [mergeRequest];
            }
        });
        return result;
    }

    public groupMergeRequestsByAuthor(mergeRequests: GitlabMergeRequest[]) {
        const result = {};
        mergeRequests.forEach((mergeRequest: GitlabMergeRequest) => {
            const key = mergeRequest.author.name;
            if (result[key] && result[key].length) {
                result[key].push(mergeRequest);
            } else {
                result[key] = [mergeRequest];
            }
        });
        return result;
    }

    public groupMergeRequestsByProject(mergeRequests: GitlabMergeRequest[]) {
        const result = {};
        mergeRequests.forEach((mergeRequest: GitlabMergeRequest) => {
            const key = mergeRequest.project_id;
            if (result[key] && result[key].length) {
                result[key].push(mergeRequest);
            } else {
                result[key] = [mergeRequest];
            }
        });
        return result;
    }
}
