export abstract class EndpointController {

    protected baseUrl: string;
    protected username: string;
    protected password: string;

    constructor(baseUrl?: string, username?: string, password?: string) {
        this.baseUrl = baseUrl;
        this.username = username;
        this.password = password;
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
