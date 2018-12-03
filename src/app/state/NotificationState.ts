import { AutoWired, Singleton } from 'typescript-ioc';

interface INotification {
    type: string;
    payload: any;
}

export enum NotificationType {
    BURNDOWNCHART_READY = 'burndownchart_ready'
}

@AutoWired
@Singleton
export default class NotificationState {

    private notifications: INotification[] = [];

    add(notification: INotification) {
        this.notifications.push(notification);
    }

    getAll(): INotification[] {
        return this.notifications;
    }

    getByType(type: string): INotification {
        return this.notifications.find((notification: INotification) => notification.type === type);
    }

    removeAllByType(type: string): void {
        this.notifications.filter((notification: INotification) => notification.type !== type);
    }

    clear() {
        this.notifications = [];
    }

}
