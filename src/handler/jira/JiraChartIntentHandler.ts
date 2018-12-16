import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { Inject } from 'typescript-ioc';
import { buildImageDirective } from '../../apl/datasources';
import { JiraSprint } from '../../endpoint/jira/domain/JiraSprint';
import { HandlerError } from '../../error/HandlerError';
import { elicitSlot, ElicitationStatus } from '../handlerUtils';

export default class JiraChartIntentHandler {

    @Inject
    private controller: JiraEndpointController;

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
            const publicScreenshotUrl = this.controller.getBurndownChartUrl(36, loadedSprint.id);
            if (publicScreenshotUrl) {
                response
                    .say(`Hier ist das Burndown Chart von Sprint ${loadedSprint.getSprintNumber()}.`)
                    .directive(buildImageDirective({
                        title: `Burndownchart von Sprint ${loadedSprint.getSprintNumber()}`,
                        subtitle: loadedSprint.goal,
                        imageUrl: publicScreenshotUrl,
                        logoUrl: 'https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png'
                    })
                );
            } else {
                this.controller.crawlBurndownChart(36, loadedSprint.id);
                response
                    .say(`Ich suche das Burndown Chart von Sprint ${loadedSprint.getSprintNumber()} heraus und sage dir gleich bescheid.`);
            }
        } else {
            throw new HandlerError(`Ich konnte den angeforderten Sprint nicht laden.`);
        }

        return response.shouldEndSession(true);
    }
}
