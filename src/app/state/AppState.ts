import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import EmployeeState from './EmployeeState';
import DeviceState from './DeviceState';

@AutoWired
@Singleton
export default class AppState {

    @Inject
    private employeeState: EmployeeState;

    @Inject
    private deviceState: DeviceState;

    private protocol: string = 'https';
    private hostname: string;

    private firstStart: boolean = true;

    getEmployeeState(): EmployeeState {
        return this.employeeState;
    }

    getDeviceState(): DeviceState {
        return this.deviceState;
    }

    setHostname(hostname: string) {
        this.hostname = hostname;
    }

    getBaseUrl(): string {
        return `${this.protocol}://${this.hostname}/`;
    }

    setFirstStart(firstStart: boolean) {
        this.firstStart = firstStart;
    }

    isFirstStart(): boolean {
        return this.firstStart;
    }

}
