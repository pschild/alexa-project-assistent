import { Inject } from 'typescript-ioc';
import * as alexa from 'alexa-app';
import AppState from '../../app/state/AppState';
import { HandlerError } from '../error/HandlerError';
import { IPieChartDataItem, PieChartController } from '../../media/PieChartController';
import { IssueSeverity, QualityGateStatus } from '../../endpoint/sonarqube/domain/enum';
import { SonarQubeEndpointController } from '../../endpoint/sonarqube/SonarQubeEndpointController';
import { ProgressBarChartController } from '../../media/ProgressBarChartController';
import { buildSonarQubeDashboardDirective } from '../../apl/datasources';
import { elicitSlot, ElicitationStatus } from '../utils/handlerUtils';
import { pause } from '../utils/speechUtils';
import IIntentHandler from '../IIntentHandler';

export default class SonarQubeDashboardIntentHandler implements IIntentHandler {

    @Inject
    private appState: AppState;

    @Inject
    private controller: SonarQubeEndpointController;

    @Inject
    private pieChartController: PieChartController;

    @Inject
    private progressBarChartController: ProgressBarChartController;

    public async generateIssueSeverityChart(projectKeys: string[]): Promise<string> {
        const results = await Promise.all(projectKeys.map(key => this.controller.getOpenIssuesOfProject(key)));
        const severitiesCount = {
            info: 0, minor: 0, major: 0, critical: 0, blocker: 0
        };
        results.forEach(result => {
            result.issues.forEach(issue => {
                switch (issue.severity) {
                    case IssueSeverity.INFO:
                        severitiesCount.info++;
                        break;
                    case IssueSeverity.MINOR:
                        severitiesCount.minor++;
                        break;
                    case IssueSeverity.MAJOR:
                        severitiesCount.major++;
                        break;
                    case IssueSeverity.BLOCKER:
                        severitiesCount.blocker++;
                        break;
                    case IssueSeverity.CRITICAL:
                        severitiesCount.critical++;
                        break;
                }
            });
        });

        const data: IPieChartDataItem[] = [
            { label: `INFO (${severitiesCount.info})`, value: severitiesCount.info },
            { label: `MINOR (${severitiesCount.minor})`, value: severitiesCount.minor },
            { label: `MAJOR (${severitiesCount.major})`, value: severitiesCount.major },
            { label: `CRITICAL (${severitiesCount.critical})`, value: severitiesCount.critical },
            { label: `BLOCKER (${severitiesCount.blocker})`, value: severitiesCount.blocker }
        ];

        const chartUrl = await this.pieChartController
            .setTextColor('#fff')
            .setColorRange(['#4b9fd5', '#b0d513', '#d4333f', '#901d25', '#460308'])
            .generateChart(data).catch((e) => {
                throw new HandlerError(`Ich konnte das Diagramm nicht erstellen.`);
            });
        return chartUrl;
    }

    public async generateCoverageChart(projectKeys: string[]): Promise<string> {
        const results = await Promise.all(projectKeys.map(key => this.controller.getMeasuresOfProject(key)));
        let projectCount = 0;
        let coverageSum = 0;
        results.forEach(result => {
            const coverageMetric = result.measures.find(measure => measure.metric === 'coverage');
            if (coverageMetric) {
                projectCount++;
                coverageSum += +coverageMetric.value;
            }
        });

        const percent = (coverageSum / projectCount).toFixed(0);
        const coverageChartUrl = await this.progressBarChartController.generateChart([
            { label: `${projectCount > 1 ? 'Ø ' : ''}${percent}%`, percent }
        ]).catch((e) => {
            throw new HandlerError(`Ich konnte das Diagramm nicht erstellen.`);
        });
        return coverageChartUrl;
    }

    public async getQualityGateStatus(projectKey: string): Promise<QualityGateStatus> {
        const result = await this.controller.getQualityGateStatusOfProject(projectKey);
        return result.status;
    }

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        let projectKeys = [];
        const projectNameElicitationResult = elicitSlot(request, 'SonarQubeProjectName');
        if (projectNameElicitationResult.status === ElicitationStatus.SUCCESS) {
            projectKeys = [request.slots.SonarQubeProjectName.resolution().values[0].id];
        } else {
            projectKeys = SonarQubeEndpointController.DEMO_PROJECTS.map(project => project.name);
        }

        const issuesImageUrl = await this.generateIssueSeverityChart(projectKeys);
        const coverageImageUrl = await this.generateCoverageChart(projectKeys);
        const qualityGatesResults = await Promise.all(projectKeys.map(project => this.getQualityGateStatus(project)));

        const projects = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < projectKeys.length; i++) {
            projects.push({
                name: projectKeys[i],
                qualityGateIconUrl: this.getIconUrlByStatus(qualityGatesResults[i])
            });
        }

        const anyQualityGateFailed = qualityGatesResults.find(status => status === QualityGateStatus.ERROR);

        return response
            .say(
                projectNameElicitationResult.status === ElicitationStatus.SUCCESS
                ? `Hier ist eine Übersicht vom Projekt ${projectNameElicitationResult.value}`
                : `Hier ist eine Übersicht aller Projekte.`
            )
            .say(
                anyQualityGateFailed ? `${pause(100)}Achtung, mindestens eins der Quality Gates ist fehlgeschlagen.` : ''
            )
            .directive(buildSonarQubeDashboardDirective({
                backgroundImageUrl: this.appState.getBaseUrl() + 'static/neon60l.png',
                headline: projectKeys.length > 1 ? 'Alle Projekte' : projectKeys[0],
                coverageImageUrl,
                issuesImageUrl,
                projects
            }));
    }

    public getIconUrlByStatus(status: QualityGateStatus): string {
        const successIconUrl = this.appState.getBaseUrl() + `static/success.png`;
        const errorIconUrl = this.appState.getBaseUrl() + `static/error.png`;

        switch (status) {
            case QualityGateStatus.OK:
                return successIconUrl;
            case QualityGateStatus.ERROR:
                return errorIconUrl;
        }
    }
}
