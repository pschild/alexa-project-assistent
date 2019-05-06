import * as alexa from 'alexa-app';
import { Inject } from 'typescript-ioc';
import { GitlabEndpointController } from '../../endpoint/gitlab/GitlabEndpointController';
import { buildBuildStatusDirective } from '../../apl/datasources';
import AppState from '../../app/state/AppState';
import { JobState, PipelineState } from '../../endpoint/gitlab/domain/enum';
import { GitlabJob } from '../../endpoint/gitlab/domain/GitlabJob';
import * as dateFormat from 'dateformat';
import { elicitSlot, ElicitationStatus } from '../utils/handlerUtils';

export default class GitLabBuildStatusIntentHandler {

    @Inject
    private appState: AppState;

    @Inject
    private controller: GitlabEndpointController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        let projectDetails;
        let result;

        const projectNameElicitationResult = elicitSlot(request, 'GitLabProjectName');
        if (projectNameElicitationResult.status === ElicitationStatus.SUCCESS) {
            const projectId = +request.slots.GitLabProjectName.resolution().values[0].id;
            projectDetails = await this.controller.getProject(projectId);
            result = await this.buildMasterBuildOverview(projectId);
        } else {
            result = await this.buildProjectsOverview();
        }

        return response
            .say(`Hier ist eine Übersicht der aktuellsten master builds.`)
            .directive(buildBuildStatusDirective({
                backgroundImageUrl: this.appState.getBaseUrl() + 'static/neon60l.png',
                projectName: projectDetails ? projectDetails.name_with_namespace : undefined,
                pipelines: result
            }));
    }

    public async buildMasterBuildOverview(projectId: number) {
        const pipelines = await this.controller.getPipelinesOfProject(projectId, { branchName: 'master' });

        const [jobsResult, pipelineDetails] = await Promise.all([
            Promise.all(pipelines.map(p => this.controller.getJobsOfPipeline(projectId, p.id))),
            Promise.all(pipelines.map(p => this.controller.getPipeline(projectId, p.id)))
        ]);

        const result = [];
        for (let i = 0; i < pipelines.length; i++) {
            const pipelineId = pipelines[i].id;
            const pipelineJobs: GitlabJob[] = jobsResult[i];
            const pipelineStages = this.groupJobsByStages(pipelineJobs);

            if (pipelineDetails[i].finished_at) {
                result.push({
                    pipelineId,
                    finishedAt: dateFormat(pipelineDetails[i].finished_at, 'dd.mm.yyyy HH:MM'),
                    statusImageUrl: this.getIconUrlByPipelineStatus(pipelines[i].status),
                    branchOrProject: 'master',
                    stages: pipelineStages.map(stage => ({ name: stage.name, statusImageUrl: this.getIconUrlByJobStatus(stage.status) }))
                });
            }
        }

        return result;
    }

    public async buildProjectsOverview() {
        const projectIds = GitlabEndpointController.DEMO_PROJECTS.map(project => project.id);
        const [projectDetails, pipelines] = await Promise.all([
            Promise.all(projectIds.map(id => this.controller.getProject(id))),
            Promise.all(projectIds.map(id => this.controller.getPipelinesOfProject(id, { branchName: 'master', limit: 1 })))
        ]);

        const result = [];
        for (let i = 0; i < projectIds.length; i++) {
            const pipelineId = pipelines[i][0].id;
            const pipelineJobs = await this.controller.getJobsOfPipeline(projectIds[i], pipelines[i][0].id);
            const pipelineDetails = await this.controller.getPipeline(projectIds[i], pipelines[i][0].id);
            const pipelineStages = this.groupJobsByStages(pipelineJobs);

            if (pipelineDetails.finished_at) {
                result.push({
                    pipelineId,
                    finishedAt: dateFormat(pipelineDetails.finished_at, 'dd.mm.yyyy HH:MM'),
                    statusImageUrl: this.getIconUrlByPipelineStatus(pipelines[i][0].status),
                    branchOrProject: projectDetails[i].name,
                    stages: pipelineStages.map(stage => ({ name: stage.name, statusImageUrl: this.getIconUrlByJobStatus(stage.status) }))
                });
            }
        }

        return result;
    }

    private groupJobsByStages(jobs: GitlabJob[]) {
        const pipelineStages: Array<{name: string; status: JobState}> = [];
        jobs.map(job => {
            const existing = pipelineStages.find(entry => entry.name === job.stage);
            if (existing) {
                if (job.status === JobState.FAILED) {
                    existing.status = JobState.FAILED;
                } else if (job.status === JobState.CANCELED) {
                    existing.status = JobState.CANCELED;
                } else {
                    existing.status = job.status;
                }
            } else {
                pipelineStages.push({ name: job.stage, status: job.status });
            }
        });
        return pipelineStages;
    }

    private getIconUrlByJobStatus(status: JobState): string {
        const successIconUrl = this.appState.getBaseUrl() + `static/success.png`;
        const failIconUrl = this.appState.getBaseUrl() + `static/error.png`;
        const canceledIconUrl = this.appState.getBaseUrl() + `static/abort.png`;
        const skippedIconUrl = this.appState.getBaseUrl() + `static/skipped.png`;
        const manualIconUrl = this.appState.getBaseUrl() + `static/manual.png`;

        switch (status) {
            case JobState.SUCCESS:
                return successIconUrl;
            case JobState.CANCELED:
                return canceledIconUrl;
            case JobState.FAILED:
                return failIconUrl;
            case JobState.SKIPPED:
                return skippedIconUrl;
            case JobState.MANUAL:
                return manualIconUrl;
        }
    }

    private getIconUrlByPipelineStatus(status: PipelineState): string {
        const successIconUrl = this.appState.getBaseUrl() + `static/success.png`;
        const failIconUrl = this.appState.getBaseUrl() + `static/error.png`;
        const canceledIconUrl = this.appState.getBaseUrl() + `static/abort.png`;
        const skippedIconUrl = this.appState.getBaseUrl() + `static/skipped.png`;

        switch (status) {
            case PipelineState.SUCCESS:
                return successIconUrl;
            case PipelineState.CANCELED:
                return canceledIconUrl;
            case PipelineState.FAILED:
                return failIconUrl;
            case PipelineState.SKIPPED:
                return skippedIconUrl;
        }
    }
}
