import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { Inject } from 'typescript-ioc';
import { buildImageDirective } from '../../apl/datasources';
import { JiraSprint } from '../../endpoint/jira/domain/JiraSprint';
import { HandlerError } from '../../error/HandlerError';
import { elicitSlot, ElicitationStatus } from '../handlerUtils';
import { ILineChartDataItem, LineChartController } from '../../media/LineChartController';

export default class JiraChartIntentHandler {

    @Inject
    private controller: JiraEndpointController;

    @Inject
    private lineChartController: LineChartController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const currentSprint: JiraSprint = await this.controller.getCurrentSprint();

        const sprintNumberElicitationResult = elicitSlot(request, 'BurndownChartSprintNumber');
        const sprintTypeElicitationResult = elicitSlot(request, 'BurndownChartSprintType', true);

        if (
            sprintNumberElicitationResult.status === ElicitationStatus.MISSING
            && sprintTypeElicitationResult.status !== ElicitationStatus.SUCCESS
        ) {
            return response
                .say(`Von welchem Sprint soll ich dir das Burndown Chart zeigen? `
                    + `Sage zum Beispiel ${currentSprint.name} für den aktuellen Sprint.`
                )
                .directive(sprintNumberElicitationResult.directive)
                .shouldEndSession(false);
        }

        let loadedSprint: JiraSprint;
        if (sprintNumberElicitationResult.status === ElicitationStatus.SUCCESS) {
            const sprintNumberValue = parseInt(sprintNumberElicitationResult.value, 0);
            if (isNaN(sprintNumberValue)) {
                throw new HandlerError(`Ich habe dich nicht genau verstanden. Versuche es bitte noch einmal.`);
            }
            loadedSprint = await this.controller.getSprintBySprintNumber(sprintNumberValue);

        } else if (sprintTypeElicitationResult.status === ElicitationStatus.SUCCESS) {
            const sprintTypeValue = request.slots.BurndownChartSprintType.resolution().first().id;
            if (sprintTypeValue === 'current') {
                loadedSprint = currentSprint;
            } else if (sprintTypeValue === 'last') {
                loadedSprint = await this.controller.getPreviousSprint();
            }
        }

        if (loadedSprint) {
            console.log(loadedSprint);
            let { burndownData, idealData } = await this.controller.getBurndownData(48, 58);
            burndownData = burndownData.map(row => ({ key: new Date(row.key), value: row.value / 3600 }));
            idealData = idealData.map(row => ({ key: new Date(row.key), value: row.value / 3600 }));

            const chartData: ILineChartDataItem[] = [
                { name: 'burndownData', values: burndownData, isStepped: true },
                { name: 'idealData', values: idealData }
            ];
            const lineChartUrl = await this.lineChartController
                .setLineColors(['#d04437', '#999'])
                .generateChart(chartData).catch((e) => {
                    throw new HandlerError(`Ich konnte das Diagramm nicht finden.`);
                });
            response
                .say(`Hier ist das Burndown Chart von Sprint ${loadedSprint.getSprintNumber()}.`)
                .directive(buildImageDirective({
                    title: `Burndownchart von Sprint ${loadedSprint.getSprintNumber()}`,
                    imageUrl: lineChartUrl
                })
                );
        } else {
            throw new HandlerError(`Ich konnte den angeforderten Sprint nicht laden.`);
        }

        return response.shouldEndSession(true);
    }
}
