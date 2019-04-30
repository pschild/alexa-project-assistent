import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { Inject } from 'typescript-ioc';
import { buildSprintProgressDirective } from '../../apl/datasources';
import { IssueType, SwimlaneStatus } from '../../endpoint/jira/domain/enum';
import { JiraIssue } from '../../endpoint/jira/domain/JiraIssue';
import { sayAsDecimal, sayAsDate } from '../../app/speechUtils';
import { HandlerError } from '../../error/HandlerError';
import { ProgressBarChartController } from '../../media/ProgressBarChartController';
import * as dateFormat from 'dateformat';

export default class JiraSprintProgressIntentHandler {

    @Inject
    private controller: JiraEndpointController;

    @Inject
    private progressBarChartController: ProgressBarChartController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const activeSprint = await this.controller.getCurrentSprint();
        const issuesOfSprint = await this.controller.getIssuesOfSprint(activeSprint.id);

        const nonSubtasks = issuesOfSprint.issues.filter((i: JiraIssue) => i.fields.issuetype.name !== IssueType.SUBTASK);
        const workableIssues = issuesOfSprint.issues.filter((i: JiraIssue) => (
            i.fields.issuetype.name === IssueType.BUG || // Bugs
            i.fields.issuetype.name === IssueType.SUBTASK || // Subtasks
            (i.fields.issuetype.name === IssueType.TASK && (!i.getSubtasks() || !i.getSubtasks().length)) // Tasks without subtasks
        ));

        const todoWorkableIssues = workableIssues.filter((i: JiraIssue) => i.getSwimlaneStatus() === SwimlaneStatus.TODO).length;
        const doingWorkableIssues = workableIssues.filter((i: JiraIssue) => i.getSwimlaneStatus() === SwimlaneStatus.IN_PROGRESS).length;
        const doneWorkableIssues = workableIssues.filter((i: JiraIssue) => i.getSwimlaneStatus() === SwimlaneStatus.DONE).length;
        const sprintTaskProgress = ((doneWorkableIssues / workableIssues.length) * 100).toFixed(0);

        const sprintTimeProgress = (activeSprint.getProgress() * 100).toFixed(0);

        let sumOriginalEst = 0;
        let sumRemainingEst = 0;
        nonSubtasks.forEach((issue: JiraIssue) => {
            sumOriginalEst += issue.getOriginalEstimateSeconds() || 0;
            sumRemainingEst += issue.getRemainingEstimateSeconds() || 0;
        });
        const taskTimeProgress = ((1 - (sumRemainingEst / sumOriginalEst)) * 100).toFixed(0);

        const workableIssuesProgressChartUrl = await this.progressBarChartController.generateChart([
            { label: `${doneWorkableIssues}/${workableIssues.length}`, percent: sprintTaskProgress }
        ]).catch((e) => {
            throw new HandlerError(`Ich konnte das Diagramm nicht erstellen.`);
        });

        const timeProgressChartUrl = await this.progressBarChartController.generateChart([
            { label: `${sprintTimeProgress}%`, percent: sprintTimeProgress }
        ]).catch((e) => {
            throw new HandlerError(`Ich konnte das Diagramm nicht erstellen.`);
        });

        const taskProgressChartUrl = await this.progressBarChartController.generateChart([
            { label: `${taskTimeProgress}%`, percent: taskTimeProgress }
        ]).catch((e) => {
            throw new HandlerError(`Ich konnte das Diagramm nicht erstellen.`);
        });

        return response
            .say(
                `Der aktuelle Sprint läuft bis zum ${sayAsDate(activeSprint.endDate)}. `
                + `${doneWorkableIssues} von ${workableIssues.length} Aufgaben wurden bereits erledigt. `
                + `Es sind bisher ${sayAsDecimal(sprintTimeProgress)} Prozent der Zeit verstrichen und `
                + `${sayAsDecimal(taskTimeProgress)} Prozent des Aufwands erledigt worden.`
            )
            .directive(buildSprintProgressDirective({
                sprintName: activeSprint.name,
                sprintGoal: activeSprint.goal,
                sprintFrom: dateFormat(activeSprint.startDate, 'dd.mm.yyyy HH:MM'),
                sprintTo: dateFormat(activeSprint.endDate, 'dd.mm.yyyy HH:MM'),
                workableIssuesProgressImageUrl: workableIssuesProgressChartUrl,
                timeProgressImageUrl: timeProgressChartUrl,
                taskProgressImageUrl: taskProgressChartUrl
            }));
    }
}
