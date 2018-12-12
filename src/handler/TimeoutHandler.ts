import * as alexa from 'alexa-app';
import { AbstractIntentHandler } from './AbstractIntentHandler';
import { NotificationType, Notification } from '../app/state/NotificationState';
import { buildImageDirective } from '../apl/datasources';

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
        const notificationState = this.appState.getNotificationState();
        console.log(`HANDLE TIMEOUT`);
        console.log(JSON.stringify(notificationState.getAll()));
        if (
            request.data.request.events
            && request.data.request.events.length
            && request.data.request.events[0].name === TimeoutHandler.TIMEOUT_EVENT_NAME
            && notificationState.hasNotifications()
        ) {
            const firstNotification: Notification = notificationState.getFirst();
            if (firstNotification) {
                switch (firstNotification.type) {
                    case NotificationType.BURNDOWNCHART_READY:
                        const publicScreenshotUrl = firstNotification.payload;
                        this.addDirective(buildImageDirective({
                            title: `Burndownchart von Sprint tbd`,
                            imageUrl: publicScreenshotUrl,
                            logoUrl: 'https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png'
                        }));
                        this.speech.say(`Bitteschön`);
                        break;
                }
                notificationState.remove(firstNotification);
            }
        }

        this.outputDirectives.map((d) => response.directive(d));
        return response.say(this.speech.ssml(true)).shouldEndSession(true);
    }
}
