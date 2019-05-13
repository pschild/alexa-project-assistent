import * as alexa from 'alexa-app';
import { Inject } from 'typescript-ioc';
import { GitlabEndpointController } from '../../endpoint/gitlab/GitlabEndpointController';
import { buildScsDashboardDirective } from '../../apl/datasources';
import { SonarQubeEndpointController } from '../../endpoint/sonarqube/SonarQubeEndpointController';
import SonarQubeDashboardIntentHandler from '../sonarqube/SonarQubeDashboardIntentHandler';
import GitLabMergeRequestsIntentHandler from '../gitlab/GitLabMergeRequestsIntentHandler';
import GitLabBuildStatusIntentHandler from '../gitlab/GitLabBuildStatusIntentHandler';
import AppState from '../../app/state/AppState';
import IIntentHandler from '../IIntentHandler';
import { sendProgressiveResponse } from '../utils/handlerUtils';

export default class ScsDashboardIntentHandler implements IIntentHandler {

    @Inject
    private appState: AppState;

    @Inject
    private sonarQubeDashboardIntentHandler: SonarQubeDashboardIntentHandler;

    @Inject
    private gitLabMergeRequestsIntentHandler: GitLabMergeRequestsIntentHandler;

    @Inject
    private gitLabBuildStatusIntentHandler: GitLabBuildStatusIntentHandler;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        sendProgressiveResponse(request, 'Gut. Moment, ich sammle alle nötigen Infos.');

        const sqProjectKeys = SonarQubeEndpointController.DEMO_PROJECTS.map(project => project.name);
        const glProjectKeys = GitlabEndpointController.DEMO_PROJECTS.map(project => project.id);

        const qgStatus = await Promise.all(sqProjectKeys.map(key => this.sonarQubeDashboardIntentHandler.getQualityGateStatus(key)));
        const mergeRequests = await this.gitLabMergeRequestsIntentHandler.getMergeRequests(glProjectKeys);
        const masterBuilds = await Promise.all(glProjectKeys.map(key => this.gitLabBuildStatusIntentHandler.buildMasterBuildOverview(key)));
        const latestMasterBuilds = masterBuilds.map(builds => builds[0]);

        const projects = [];
        for (let i = 0; i < sqProjectKeys.length; i++) {
            projects.push({
                name: sqProjectKeys[i],
                latestMasterBuildStatusImageUrl: latestMasterBuilds[i].statusImageUrl,
                qgStatusImageUrl: this.sonarQubeDashboardIntentHandler.getIconUrlByStatus(qgStatus[i]),
                openMergeRequests: mergeRequests.projects[i].mrCount
            });
        }

        return response
            .say('Hier ist eine Übersicht über alle Teilprojekte.')
            .directive(buildScsDashboardDirective({
                backgroundImageUrl: this.appState.getBaseUrl() + 'static/neon60l.png',
                projects
            }));
    }
}
