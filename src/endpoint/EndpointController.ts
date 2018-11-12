export class EndpointController {

    protected baseUrl: string;
    protected username: string;
    protected password: string;

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
}
