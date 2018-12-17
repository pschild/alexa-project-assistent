import { EndpointController } from '../EndpointController';
import { plainToClass } from 'class-transformer';
import { JiraIssue } from './domain/JiraIssue';
import { AutoWired, Singleton } from 'typescript-ioc';
import * as Pageres from 'Pageres';
import * as path from 'path';
import { existsSync } from 'fs';
import { NotificationType, Notification } from '../../app/state/NotificationState';
import { IssueType, IssueStatus, SprintStatus } from './domain/enum';
import { JiraIssueSearchResult } from './domain/JiraIssueSearchResult';
import { JiraSprint } from './domain/JiraSprint';

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
            uri: `${this.baseUrl}rest/api/${JiraEndpointController.API_VERSION}/issue/${identifier}`
        });
        return plainToClass(JiraIssue, result as JiraIssue);
    }

    public async getSprintsOfBoard(boardId: number, stateFilter?: SprintStatus[]): Promise<JiraSprint[]> {
        const result = await this.get({
            uri: `${this.baseUrl}rest/agile/1.0/board/${boardId}/sprint${stateFilter ? `?state=${stateFilter.join(',')}` : ``}`
        });
        return (result.values as JiraSprint[]).map((sprint) => plainToClass(JiraSprint, sprint));
    }

    public async getSprint(sprintId: number): Promise<JiraSprint> {
        const result = await this.get({
            uri: `${this.baseUrl}rest/agile/1.0/sprint/${sprintId}`
        });
        return plainToClass(JiraSprint, result as JiraSprint);
    }

    public async getSprintBySprintNumber(sprintNo: number): Promise<JiraSprint> {
        const sprintsOfBoard = await this.getSprintsOfBoard(36); // TODO: constant
        if (sprintsOfBoard) {
            const pattern = new RegExp(`sprint ${sprintNo}`, 'i');
            return sprintsOfBoard.find((sprint: JiraSprint) => sprint.name.search(pattern) >= 0);
        }
    }

    public async getCurrentSprint(): Promise<JiraSprint> {
        const activeSprints = await this.getSprintsOfBoard(36, [SprintStatus.ACTIVE]); // TODO: constant
        if (activeSprints.length > 1) {
            throw new Error(`Expected to have one active sprint, but found ${activeSprints.length} active ones`);
        }
        return activeSprints[0];
    }

    public async getPreviousSprint(): Promise<JiraSprint> {
        const sprints = await this.getSprintsOfBoard(36); // TODO: constant
        const activeIndex = sprints.findIndex((sprint: JiraSprint) => sprint.state === SprintStatus.ACTIVE);
        if (activeIndex < 0) {
            throw new Error(`Could not find an active sprint`);
        } else if (activeIndex === 0) {
            throw new Error(`Could not find a previous sprint`);
        }
        return sprints[activeIndex - 1];
    }

    public async searchIssues(): Promise<JiraIssueSearchResult> {
        const jql = `issuetype = ${IssueType.BUG} AND status = ${IssueStatus.OPEN} AND assignee in (EMPTY)`;
        const result = await this.get({
            uri: `${this.baseUrl}rest/api/${JiraEndpointController.API_VERSION}/search`
                + `?jql=${encodeURIComponent(jql)}`
                + `&fields=issuetype,priority,status`
        });
        return plainToClass(JiraIssueSearchResult, result as JiraIssueSearchResult);
    }

    public async getIssuesOfSprint(sprintId: number): Promise<JiraIssueSearchResult> {
        const result = await this.get({
            uri: `${this.baseUrl}rest/agile/1.0/sprint/${sprintId}/issue`
                + `?fields=resolution,issuetype,assignee,status,summary,timetracking`
                + `&maxResults=1000`
        });
        return plainToClass(JiraIssueSearchResult, result as JiraIssueSearchResult);
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
            .src(`${process.env.JIRA_BASE_URL}secure/RapidBoard.jspa`
                + `?rapidView=${boardId}`
                + `&view=reporting`
                + `&chart=burndownChart`
                + `&sprint=${sprintId}`,
                ['993x1080']
            )
            .dest(path.join(process.cwd(), 'media-gen'))
            .run()
            .catch((error) => {
                throw new Error(`Error while crawling website: ${error.message}`);
            });
        if (result && result.length) {
            this.appState.getNotificationState().add(
                new Notification(NotificationType.BURNDOWNCHART_READY, {
                    sprintId,
                    publicScreenshotUrl: this.appState.getBaseUrl() + result[0].filename
                })
            );

            return Promise.resolve(this.appState.getBaseUrl() + result[0].filename);
        }
        return Promise.reject(`Screenshot could not be created.`);
    }
}
