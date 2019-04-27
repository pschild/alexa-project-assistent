import AppState from '../app/state/AppState';
import { Inject } from 'typescript-ioc';
import { NotificationType, buildNotificationDirective } from './datasources';
import { HandlerError } from '../error/HandlerError';

export class NotificationBuilder {

    @Inject
    protected appState: AppState;

    public buildSuccessNotification(text: string) {
        return this.buildNotification(NotificationType.SUCCESS, text);
    }

    public buildErrorNotification(text: string) {
        return this.buildNotification(NotificationType.ERROR, text);
    }

    public buildWarningNotification(text: string) {
        return this.buildNotification(NotificationType.WARNING, text);
    }

    public buildNotification(type: NotificationType, text: string) {
        return buildNotificationDirective({
            backgroundImageUrl: '',
            type,
            iconUrl: this.getIconUrlByType(type),
            text
        });
    }

    private getIconUrlByType(type: NotificationType) {
        switch (type) {
            case NotificationType.SUCCESS:
                return this.appState.getBaseUrl() + `static/success.png`;
            case NotificationType.ERROR:
                return this.appState.getBaseUrl() + `static/error.png`;
            case NotificationType.WARNING:
                return this.appState.getBaseUrl() + `static/warning.png`;
            default:
                throw new HandlerError(`Es ist ein Fehler aufgetreten.`);
        }
    }

}
