import * as alexa from 'alexa-app';
import { AbstractIntentHandler } from './AbstractIntentHandler';
import { NotificationType } from '../app/state/NotificationState';

export default class TimeoutHandler extends AbstractIntentHandler {

    private static TIMEOUT_EVENT_NAME: string = 'timeOut';
    private static TIMEOUT_DURATION: number = 5000;
    public static TIMEOUT_DIRECTIVE = {
        type: 'GameEngine.StartInputHandler',
        timeout: TimeoutHandler.TIMEOUT_DURATION,
        recognizers: {},
        events: {
            [TimeoutHandler.TIMEOUT_EVENT_NAME]: {
                meets: ['timed out'],
                reports: 'history',
                shouldEndInputHandler: true
            }
        }
    };

    protected async handleSpecificIntent(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        if (
            request.data.request.events
            && request.data.request.events.length
            && request.data.request.events[0].name === TimeoutHandler.TIMEOUT_EVENT_NAME
        ) {
            const notificationState = this.appState.getNotificationState();
            console.log(JSON.stringify(notificationState.getAll()));
            const burndownChartReadyNotification = notificationState.getByType(NotificationType.BURNDOWNCHART_READY);
            if (burndownChartReadyNotification) {
                const screenshotUrl = burndownChartReadyNotification.payload;
                notificationState.removeAllByType(NotificationType.BURNDOWNCHART_READY);

                return response
                    .say(`Hier ist dein Burndownchart.`)
                    .directive({
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
                    });
            }
        }
    }
}
