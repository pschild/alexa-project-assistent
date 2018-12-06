import { EndpointController } from '../EndpointController';
import { plainToClass } from 'class-transformer';
import { JiraIssue } from './domain/JiraIssue';
import { AutoWired, Singleton } from 'typescript-ioc';
import * as Pageres from 'Pageres';
import * as path from 'path';
import { existsSync } from 'fs';
import { NotificationType, Notification } from '../../app/state/NotificationState';

@AutoWired
@Singleton
export class JiraEndpointController extends EndpointController {

    public static API_VERSION: number = 2;

    // TODO: extract to MediaController (?)
    public static SCREENSHOT_FORMAT: string = 'png';

    public config(baseUrl?: string, username?: string, password?: string) {
        return super.config(
            baseUrl || process.env.JIRA_BASE_URL,
            username || process.env.JIRA_USERNAME,
            password || process.env.JIRA_PASSWORD
        );
    }

    public async getIssue(identifier: string): Promise<JiraIssue> {
        const result = await this.get({
            uri: `${this.baseUrl}/rest/api/${JiraEndpointController.API_VERSION}/issue/${identifier}`
        });
        return plainToClass(JiraIssue, result as JiraIssue);
    }

    public getBurndownChartUrl(boardId: number, sprintId: number): string {
        // TODO: extract to MediaController (?)
        const filename = `burndown-rapidView${boardId}-sprint${sprintId}`;
        if (existsSync(path.join(process.cwd(), 'media-gen', `${filename}.${JiraEndpointController.SCREENSHOT_FORMAT}`))) {
            return this.appState.getBaseUrl() + filename + '.' + JiraEndpointController.SCREENSHOT_FORMAT;
        }
        return undefined;
    }

    public async crawlBurndownChart(boardId: number, sprintId: number): Promise<string> {
        // TODO: extract to MediaController (?)
        const filename = `burndown-rapidView${boardId}-sprint${sprintId}`;

        // TODO: does it overwrite already existing images?
        const options = {
            delay: 5, // seconds
            username: process.env.JIRA_USERNAME,
            password: process.env.JIRA_PASSWORD,
            selector: '#ghx-chart-wrap',
            format: JiraEndpointController.SCREENSHOT_FORMAT,
            filename
        };
        // TODO: extract to own helper class?
        const result = await new Pageres(options)
            .src(`${process.env.JIRA_BASE_URL}secure/RapidBoard.jspa?rapidView=${boardId}&view=reporting&chart=burndownChart&sprint=${sprintId}`, ['1920x1080'])
            .dest(path.join(process.cwd(), 'media-gen'))
            .run()
            .catch((error) => {
                throw new Error(`Error while crawling website: ${error.message}`);
            });
        if (result && result.length) {
            this.appState.getNotificationState().add(
                new Notification(NotificationType.BURNDOWNCHART_READY, this.appState.getBaseUrl() + result[0].filename)
            );

            return Promise.resolve(this.appState.getBaseUrl() + result[0].filename);
        }
        return Promise.reject(`Screenshot could not be created.`);
    }
}
