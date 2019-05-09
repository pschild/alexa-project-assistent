import * as alexa from 'alexa-app';
import { Inject } from 'typescript-ioc';
import { GitlabEndpointController } from '../../endpoint/gitlab/GitlabEndpointController';
import { buildMergeRequestsDirective } from '../../apl/datasources';
import { GitlabMergeRequest } from '../../endpoint/gitlab/domain/GitlabMergeRequest';
import * as humanizeDuration from 'humanize-duration';
import AppState from '../../app/state/AppState';
import IIntentHandler from '../IIntentHandler';

export default class GitLabMergeRequestsIntentHandler implements IIntentHandler {

    @Inject
    protected appState: AppState;

    @Inject
    private controller: GitlabEndpointController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const projectIds = GitlabEndpointController.DEMO_PROJECTS.map(project => project.id);
        const result = await this.getMergeRequests(projectIds);
        return response
            .say(`In allen Teilprojekten gibt es derzeit ${result.mrCountAll} offene Merge Requests.`)
            .directive(buildMergeRequestsDirective({
                backgroundImageUrl: this.appState.getBaseUrl() + 'static/neon60l.png',
                projects: result.projects
            }));
    }

    public async getMergeRequests(projectIds: number[]): Promise<any> {
        const [openMergeRequests, projectDetails] = await Promise.all([
            this.controller.getAllOpenMergeRequests(),
            Promise.all(projectIds.map(id => this.controller.getProject(id)))
        ]);

        const filteredMrs = openMergeRequests.filter(mr => projectIds.includes(+mr.project_id));
        const groupedMrs = this.controller.groupMergeRequestsByProject(filteredMrs);
        let mrCountAll = 0;
        const projects = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < projectIds.length; i++) {
            const projectId = projectIds[i];
            const projectName = projectDetails.find(p => p.id === projectId).name;
            const projectMrs = groupedMrs[projectId];
            if (projectMrs) {
                const mrCount = projectMrs.length;
                mrCountAll += mrCount;
                const mrResult = projectMrs
                    .map((mr: GitlabMergeRequest) => ({
                        updated_at: mr.updated_at,
                        age: humanizeDuration(
                            new Date().getTime() - mr.updated_at.getTime(),
                            { units: ['d', 'h', 'm'], largest: 2, language: 'de', round: true }
                        ),
                        assigneeName: mr.assignee ? mr.assignee.name : undefined
                    }))
                    .sort(this.compareMergeRequests);
                projects.push({ projectName, mrCount, mergeRequests: mrResult });
            } else {
                projects.push({ projectName, mrCount: 0, mergeRequests: [] });
            }
        }
        return {
            projects,
            mrCountAll
        };
    }

    private compareMergeRequests(a: GitlabMergeRequest, b: GitlabMergeRequest) {
        if (a.updated_at.getTime() > b.updated_at.getTime()) {
            return -1;
        }
        if (a.updated_at.getTime() < b.updated_at.getTime()) {
            return 1;
        }
        return 0;
    }
}
