import * as alexa from 'alexa-app';
import { NotificationType, Notification } from '../app/state/NotificationState';
import { buildImageDirective } from '../apl/datasources';
import AppState from '../app/state/AppState';
import { Inject } from 'typescript-ioc';

export default class TimeoutHandler {

    @Inject
    private appState: AppState;

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

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
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
                        const payload = firstNotification.payload;
                        response.directive(buildImageDirective({
                            title: `Burndownchart von Sprint ${payload.sprint.getSprintNumber()}`,
                            imageUrl: payload.publicScreenshotUrl
                        }));
                        response.say(`Hier ist das Burndownchart von Sprint ${payload.sprint.getSprintNumber()}`);
                        break;
                }
                notificationState.remove(firstNotification);
            }
        }

        return response.shouldEndSession(true);
    }
}
