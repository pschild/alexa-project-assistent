import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../endpoint/jira/JiraEndpointController';
import { Inject } from 'typescript-ioc';
import { AbstractIntentHandler } from './AbstractIntentHandler';

export default class JiraChartIntentHandler extends AbstractIntentHandler {

    @Inject
    private controller: JiraEndpointController;

    protected async handleSpecificIntent(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        if (!request.getDialog().isCompleted()) {
            const updatedIntent = request.data.request.intent;
            return response
                .directive({
                    type: 'Dialog.Delegate',
                    updatedIntent
                })
                .shouldEndSession(false);
        }

        const sprintNumberValue = request.slot('BurndownChartSprint');
        console.log(sprintNumberValue);

        const publicScreenshotUrl = this.controller.getBurndownChartUrl(36, 37);
        if (publicScreenshotUrl) {
            this.speech.say(`Hier ist das aktuelle Burndown Chart.`);
            this.addDirective(this.addBurndownChartDisplay(publicScreenshotUrl));
        } else {
            this.speech.say(`Ich erstelle das Diagramm und sage dir gleich bescheid.`);
            this.controller.crawlBurndownChart(36, 37);
        }

        // this.speech
        //     .pause('100ms')
        //     .say(`Sonst noch etwas?`);

        this.outputDirectives.map((d) => response.directive(d));
        response.say(this.speech.ssml(true)).shouldEndSession(true);
    }

    // TODO: duplicated code
    private addBurndownChartDisplay(screenshotUrl: string): { type: string, template: any } {
        return {
            type: 'Display.RenderTemplate',
            template: {
                type: 'BodyTemplate1',
                backButton: 'HIDDEN',
                backgroundImage: {
                    contentDescription: '',
                    sources: [{
                        url: screenshotUrl,
                        size: 'LARGE'
                    }]
                }
            }
        };
    }

}
