import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { Inject } from 'typescript-ioc';
import { buildEffortForReleaseDirective } from '../../apl/datasources';
import { ProgressBarChartController } from '../../media/ProgressBarChartController';
import { HandlerError } from '../../error/HandlerError';
import { JiraRelease } from '../../endpoint/jira/domain/JiraRelease';
import * as dateFormat from 'dateformat';

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

        console.log({
            releaseName: 'Testrelease',
            releaseDate: dateFormat(release.releaseDate, 'dd.mm.yyyy'),
            epicCount: epicsOfRelease.total,
            originalSeconds: originalSecondsSum,
            remainingSeconds: remainingSecondsSum
        });

        return response
            .say('halla')
            .directive(buildEffortForReleaseDirective({
                releaseName,
                epicCount: epicsOfRelease.total,
                releaseDate: dateFormat(release.releaseDate, 'dd.mm.yyyy'),
                originalSeconds: originalSecondsSum,
                remainingSeconds: remainingSecondsSum,
                remainingWorkLabel: `ca. ${(remainingSecondsSum / 3600 / 8).toFixed(0)} PT`,
                taskProgressImageUrl: taskProgressChartUrl
            }));
    }
}
