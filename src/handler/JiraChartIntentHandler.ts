import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { Inject } from 'typescript-ioc';
import { AbstractIntentHandler } from './AbstractIntentHandler';
import { buildImageDirective } from '../apl/datasources';
import { JiraSprint } from '../endpoint/jira/domain/JiraSprint';

export default class JiraChartIntentHandler extends AbstractIntentHandler {

    @Inject
    private controller: JiraEndpointController;

    protected async handleSpecificIntent(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        const currentSprint: JiraSprint = await this.controller.getCurrentSprint();

        if (
            !request.slot('BurndownChartSprintNumber')
            && (!request.slots.BurndownChartSprintType.resolution() || !request.slots.BurndownChartSprintType.resolution().isMatched())
        ) {
            const updatedIntent = request.data.request.intent;
            return response
                .say(`Von welchem Sprint soll ich dir das Burndown Chart zeigen? Sage zum Beispiel ${currentSprint.name} für den aktuellen Sprint.`)
                .directive({
                    type: 'Dialog.ElicitSlot',
                    slotToElicit: 'BurndownChartSprintNumber',
                    updatedIntent
                })
                .shouldEndSession(false);
        }

        let loadedSprint: JiraSprint;
        if (request.slot('BurndownChartSprintNumber')) {
            const sprintNumberValue = parseInt(request.slot('BurndownChartSprintNumber'), 0);
            if (isNaN(sprintNumberValue)) {
                return response
                    .say(`Ich habe dich nicht genau verstanden. Versuche es bitte noch einmal.`)
                    .shouldEndSession(true);
            }
            loadedSprint = await this.controller.getSprintBySprintNumber(sprintNumberValue);
        } else if (request.slots.BurndownChartSprintType.resolution()) {
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
                this.speech.say(`Hier ist das Burndown Chart von Sprint ${loadedSprint.getSprintNumber()}.`);
                this.addDirective(buildImageDirective({
                    title: `Burndownchart von Sprint ${loadedSprint.getSprintNumber()}`, // TODO: add subtitle => loadedSprint.goal
                    imageUrl: publicScreenshotUrl,
                    logoUrl: 'https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png'
                }));
            } else {
                this.speech.say(`Ich suche das Burndown Chart von Sprint ${loadedSprint.getSprintNumber()} heraus und sage dir gleich bescheid.`);
                this.controller.crawlBurndownChart(36, loadedSprint.id);
            }
        } else {
            this.speech.say(`Ich konnte den angeforderten Sprint nicht laden.`);
        }

        // this.speech
        //     .pause('100ms')
        //     .say(`Sonst noch etwas?`);

        this.outputDirectives.map((d) => response.directive(d));
        return response.say(this.speech.ssml(true)).shouldEndSession(true);
    }
}
