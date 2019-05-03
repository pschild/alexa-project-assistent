import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { Inject } from 'typescript-ioc';
import { buildEffortForReleaseDirective } from '../../apl/datasources';
import { ProgressBarChartController } from '../../media/ProgressBarChartController';
import { JiraRelease } from '../../endpoint/jira/domain/JiraRelease';
import * as dateFormat from 'dateformat';
import { SwimlaneStatus } from '../../endpoint/jira/domain/enum';
import { sayAsDate } from '../../app/speechUtils';
import { HandlerError } from '../error/HandlerError';

export default class JiraEffortForReleaseIntentHandler {

    @Inject
    private controller: JiraEndpointController;

    @Inject
    private progressBarChartController: ProgressBarChartController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const releaseName = 'Testrelease';

        const releasesOfProjects: JiraRelease[] = await this.controller.getProjectVersions('AX');
        const release = releasesOfProjects.find(r => r.name === releaseName);

        const epicsOfRelease = await this.controller.getEpicsOfRelease(releaseName);
        const doneEpics = epicsOfRelease.issues.filter(epic => epic.getSwimlaneStatus() === SwimlaneStatus.DONE);

        const issuesOfEpics = await Promise.all(epicsOfRelease.issues.map(epic => this.controller.getIssuesByEpicLink(epic.key)));
        let originalSecondsSum = 0;
        let remainingSecondsSum = 0;
        for (let i = 0; i < epicsOfRelease.issues.length; i++) {
            const epic = epicsOfRelease.issues[i];
            const issueResult = issuesOfEpics[i];
            originalSecondsSum += issueResult.issues
                .map(issue => issue.getOriginalEstimateSeconds() || 0)
                .reduce((acc, current) => acc + current, 0);
            remainingSecondsSum += issueResult.issues
                .map(issue => issue.getRemainingEstimateSeconds() || 0)
                .reduce((acc, current) => acc + current, 0);
        }

        const taskTimeProgress = ((1 - (remainingSecondsSum / originalSecondsSum)) * 100).toFixed(0);
        const taskProgressChartUrl = await this.progressBarChartController.generateChart([
            { label: `${taskTimeProgress}%`, percent: taskTimeProgress }
        ]).catch((e) => {
            throw new HandlerError(`Ich konnte das Diagramm nicht erstellen.`);
        });

        const remainingPt = (remainingSecondsSum / 3600 / 8).toFixed(0);
        const doneEpicCount = doneEpics.length || 0;
        const remainingEpicCount = epicsOfRelease.total - doneEpicCount;

        return response
            .say(
                `Das Release ${releaseName} steht am ${sayAsDate(release.releaseDate)} an. `
                + `Bis dahin sind noch ${remainingEpicCount} Epics `
                + `mit einem Restaufwand von circa ${remainingPt} P.T. zu erledigen.`
            )
            .directive(buildEffortForReleaseDirective({
                releaseName,
                epicCount: epicsOfRelease.total,
                doneEpicCount,
                releaseDate: dateFormat(release.releaseDate, 'dd.mm.yyyy'),
                originalSeconds: originalSecondsSum,
                remainingSeconds: remainingSecondsSum,
                remainingWorkLabel: `ca. ${remainingPt} PT`,
                taskProgressImageUrl: taskProgressChartUrl
            }));
    }
}
