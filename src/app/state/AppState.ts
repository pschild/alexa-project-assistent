import { AutoWired, Singleton } from 'typescript-ioc';

@AutoWired
@Singleton
export default class AppState {

    private protocol: string = 'https';
    private hostname: string;

    private firstStart: boolean = true;
    private firstHelpCall: boolean = true;

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

    setFirstHelpCall(firstHelpCall: boolean) {
        this.firstHelpCall = firstHelpCall;
    }

    isFirstHelpCall(): boolean {
        return this.firstHelpCall;
    }

}
