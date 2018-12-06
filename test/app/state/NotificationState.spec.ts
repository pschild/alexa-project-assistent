import { Container } from 'typescript-ioc';
import NotificationState, { Notification, NotificationType } from '../../../src/app/state/NotificationState';

describe('NotificationState', () => {

    it('can be initialized', async () => {
        const notificationState = Container.get(NotificationState);

        notificationState.add(new Notification(NotificationType.BURNDOWNCHART_READY, 'some payload'));
        notificationState.add(new Notification(NotificationType.BURNDOWNCHART_READY, 42));
        notificationState.add(new Notification(NotificationType.BURNDOWNCHART_READY, { foo: 'bar' }));
        expect(notificationState.getAll().length).toBe(3);

        expect(notificationState.hasNotifications()).toBe(true);
        let first = notificationState.getFirst();
        expect(first.id).toBe(0);
        expect(first.type).toBe(NotificationType.BURNDOWNCHART_READY);
        expect(first.payload).toBe('some payload');

        notificationState.remove(first);

        expect(notificationState.hasNotifications()).toBe(true);
        first = notificationState.getFirst(NotificationType.BURNDOWNCHART_READY);
        expect(first.id).toBe(1);
        expect(first.type).toBe(NotificationType.BURNDOWNCHART_READY);
        expect(first.payload).toBe(42);

        notificationState.remove(first);

        expect(notificationState.hasNotifications()).toBe(true);
        first = notificationState.getFirst(NotificationType.BURNDOWNCHART_READY);
        expect(first.id).toBe(2);
        expect(first.type).toBe(NotificationType.BURNDOWNCHART_READY);
        expect(first.payload).toEqual({ foo: 'bar' });

        notificationState.remove(first);

        expect(notificationState.hasNotifications()).toBe(false);
    });
});
