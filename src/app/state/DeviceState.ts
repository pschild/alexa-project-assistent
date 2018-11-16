import { AutoWired, Singleton } from 'typescript-ioc';

interface IDevice {
    deviceId: string;
    prefs: any;
}

@AutoWired
@Singleton
export default class DeviceState {

    private devices: IDevice[] = [];

    // const deviceId = request.context.System.device.deviceId;
    add(deviceId: string) {
        this.devices.push({
            deviceId,
            prefs: {}
        });
    }

    getOne(deviceId: string) {
        return this.devices.find((d) => d.deviceId === deviceId);
    }

}
