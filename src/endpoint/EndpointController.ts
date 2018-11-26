import { get } from 'request-promise';
import { CoreOptions, UriOptions } from 'request';
import AppState from '../app/state/AppState';
import { Inject } from 'typescript-ioc';

export class EndpointController {

    protected baseUrl: string;
    protected username: string;
    protected password: string;

    @Inject
    protected appState: AppState;

    constructor() {
        this.config();
    }

    public config(baseUrl?: string, username?: string, password?: string) {
        this.baseUrl = baseUrl;
        this.username = username;
        this.password = password;
        return this;
    }

    public getBaseUrl() {
        return this.baseUrl;
    }

    public getUsername() {
        return this.username;
    }

    public getPassword() {
        return this.password;
    }

    public async get(givenOptions: Partial<CoreOptions & UriOptions>) {
        const options = Object.assign(this.getDefaultOptions(), givenOptions);
        return await get(options);
    }

    private getDefaultOptions(): CoreOptions & UriOptions {
        return {
            uri: this.baseUrl,
            auth: {
                username: this.username,
                password: this.password
            },
            json: true
        };
    }
}
