import * as alexa from 'alexa-app';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { Inject } from 'typescript-ioc';
import { buildImageDirective } from '../../apl/datasources';
import { BarChartController, IBarChartDataItem } from '../../media/BarChartController';
import { sayInEnglish, sayAsDecimal } from '../utils/speechUtils';
import { HandlerError } from '../error/HandlerError';
import AppState from '../../app/state/AppState';
import IIntentHandler from '../IIntentHandler';
import { sendProgressiveResponse } from '../utils/handlerUtils';

export default class JiraVelocityIntentHandler implements IIntentHandler {

    @Inject
    private appState: AppState;

    @Inject
    private controller: JiraEndpointController;

    @Inject
    private barChartController: BarChartController;

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        sendProgressiveResponse(request, 'Alles klar.');

        const data: IBarChartDataItem[] = await this.controller.getVelocityData(55);
        const chartData = data.map(bar => ({ key: bar.key, value: (+bar.value / 3600 / 8), styles: bar.styles}));
        const chartUrl = await this.barChartController
            .setYAxisUnit('PT')
            .generateChart(chartData).catch((e) => {
                throw new HandlerError(`Ich konnte das Diagramm nicht erstellen. Bitte versuche es erneut.`);
            });

        const velocity = chartData[chartData.length - 1].value;
        return response
            .say(
                `Auf Basis der letzten Sprints beträgt die ${sayInEnglish('Velocity')} ungefähr ${sayAsDecimal(velocity)} Personentage. `
                + `Dieser Wert kann als Grundlage für die Planung des nächsten Sprints verwendet werden.`
            )
            .directive(buildImageDirective({
                    backgroundImageUrl: this.appState.getBaseUrl() + 'static/neon60l.png',
                    title: ``,
                    imageUrl: chartUrl
                })
            );
    }
}
