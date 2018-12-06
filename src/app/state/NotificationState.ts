import { AutoWired, Singleton } from 'typescript-ioc';

export class Notification {
    public id: number;
    public type: NotificationType;
    public payload: any;

    constructor(type: NotificationType, payload: any) {
        this.type = type;
        this.payload = payload;
    }
}

export enum NotificationType {
    BURNDOWNCHART_READY = 'burndownchart_ready'
}

@AutoWired
@Singleton
export default class NotificationState {

    private notifications: Notification[] = [];
    private counter: number = 0;

    add(notification: Notification) {
        notification.id = this.counter++;
        this.notifications.push(notification);
    }

    getAll(): Notification[] {
        return this.notifications;
    }

    getFirst(): Notification {
        if (this.hasNotifications()) {
            return this.notifications[0];
        }
    }

    remove(notification: Notification): void {
        this.notifications = this.notifications.filter((n: Notification) => n.id !== notification.id);
    }

    clearAll() {
        this.notifications = [];
    }

    hasNotifications() {
        return this.notifications.length > 0;
    }

}
