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

    getEmployeeState(): EmployeeState {
        return this.employeeState;
    }

    getDeviceState(): DeviceState {
        return this.deviceState;
    }

}
