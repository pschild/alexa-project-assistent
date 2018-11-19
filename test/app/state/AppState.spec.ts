import { Container } from 'typescript-ioc';
import AppState from '../../../src/app/state/AppState';

describe('AppState', () => {

    it('can be initialized', async () => {
        const appState = Container.get(AppState);
        expect(appState.getEmployeeState()).toBeDefined();
        expect(appState.getDeviceState()).toBeDefined();
    });
});
