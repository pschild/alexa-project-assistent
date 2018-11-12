export class EndpointController {

    protected baseUrl: string;
    protected username: string;
    protected password: string;

    constructor() {
        this.config();
    }

    public config(baseUrl?: string, username?: string, password?: string) {
        this.baseUrl = baseUrl || process.env.JIRA_BASE_URL;
        this.username = username || process.env.JIRA_USERNAME;
        this.password = password || process.env.JIRA_PASSWORD;
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
