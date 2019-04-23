import { EndpointController } from '../EndpointController';
import { plainToClass } from 'class-transformer';
import { JiraIssue } from './domain/JiraIssue';
import { AutoWired, Singleton } from 'typescript-ioc';
// import * as Pageres from 'Pageres';
// import * as path from 'path';
// import { existsSync } from 'fs';
// import { NotificationType, Notification } from '../../app/state/NotificationState';
import { IssueType, IssueStatus, SprintStatus } from './domain/enum';
import { JiraIssueSearchResult } from './domain/JiraIssueSearchResult';
import { JiraSprint } from './domain/JiraSprint';
import { JiraTestRun } from './domain/JiraTestRun';

@AutoWired
@Singleton
export class JiraEndpointController extends EndpointController {

    public static API_VERSION: number = 2;

    // TODO: extract to MediaController (?)
    // public static SCREENSHOT_FORMAT: string = 'png';

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
        const activeSprints = await this.getSprintsOfBoard(48, [SprintStatus.ACTIVE]); // TODO: constant
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

    public async getLatestTestrunByTestIssue(identifier: string): Promise<JiraTestRun> {
        const result = await this.get({
            uri: `${this.baseUrl}rest/raven/1.0/api/test/${identifier}/testruns`
        });
        const testRuns: JiraTestRun[] = (result as JiraTestRun[]).map((run) => plainToClass(JiraTestRun, run));
        return testRuns.length ? testRuns[testRuns.length - 1] : undefined;
    }

    public async getBurndownData(rapidViewId: number, sprintId: number): Promise<any> {
        const result = await this.get({
            uri: `${this.baseUrl}rest/greenhopper/1.0/rapid/charts/scopechangeburndownchart.json`
                + `?rapidViewId=${rapidViewId}&sprintId=${sprintId}&statisticFieldId=field_timeoriginalestimate`
        });

        const sprintStartTs = result.startTime;
        const sprintEndTs = result.endTime;
        const sprintCompleteTs = result.completeTime;

        const keyTimeMap = [];
        for (const ts of Object.keys(result.changes)) {
            const entries = result.changes[ts];
            entries.forEach(entry => {
                if (entry.statC) {
                    keyTimeMap.push({
                        key: entry.key,
                        time: entry.statC.newValue || 0
                    });
                }
            });
        }
        console.log(keyTimeMap);

        let estTimeAtStart = 0;
        for (const ts of Object.keys(result.changes)) {
            const entries = result.changes[ts];
            entries.forEach(entry => {
                if (entry.added === true && +ts <= sprintStartTs) {
                    const res = keyTimeMap.find(e => e.key === entry.key);
                    estTimeAtStart += res ? res.time : 0;
                }
            });
        }
        console.log(estTimeAtStart);

        const graphEntries = [];
        graphEntries.push({ key: sprintStartTs, value: estTimeAtStart });

        let currentSum = estTimeAtStart;
        for (const ts of Object.keys(result.changes)) {
            const entries = result.changes[ts];
            entries.forEach(entry => {
                if (+ts > sprintStartTs) { // only issues that changed after sprint started
                    const res = keyTimeMap.find(e => e.key === entry.key);
                    let time = 0;
                    if (res && res.time) {
                        time = res.time;
                    }
                    if (entry.column) {
                        if (entry.column.done === true) { // done
                            currentSum -= time;
                            console.log(ts + ': ' + entry.key + ' done => -' + time + ' => ' + currentSum);
                            graphEntries.push({ key: +ts, value: currentSum });
                        } else if (entry.column.done === false) { // reopened
                            currentSum += time;
                            console.log(ts + ': ' + entry.key + ' reopened => +' + time + ' => ' + currentSum);
                            graphEntries.push({ key: +ts, value: currentSum });
                        }
                    } else if (entry.added === true) { // added during sprint
                        currentSum += time;
                        console.log(ts + ': ' + entry.key + ' added => +' + time + ' => ' + currentSum);
                        graphEntries.push({ key: +ts, value: currentSum });
                    } else if (entry.added === false) { // removed during sprint
                        currentSum -= time;
                        console.log(ts + ': ' + entry.key + ' removed => -' + time + ' => ' + currentSum);
                        graphEntries.push({ key: +ts, value: currentSum });
                    } else if (entry.statC && entry.statC.newValue) { // changed during sprint
                        let diff;
                        if (entry.statC.oldValue) {
                            diff = entry.statC.newValue - entry.statC.oldValue;
                        } else {
                            diff = entry.statC.newValue - time;
                        }
                        currentSum += diff;
                        console.log(ts + ': ' + entry.key + ' changed => ' + diff + ' => ' + currentSum);
                        graphEntries.push({ key: +ts, value: currentSum });
                        res.time = entry.statC.newValue;
                    }
                }
            });
        }
        if (sprintCompleteTs) {
            graphEntries.push({ key: sprintCompleteTs, value: currentSum });
            graphEntries.push({ key: sprintCompleteTs, value: undefined });
            graphEntries.push({ key: sprintEndTs, value: undefined });
        } else {
            const lastEntry: any = graphEntries.slice(-1);
            graphEntries.push({ key: lastEntry.key, value: undefined });
            graphEntries.push({ key: sprintEndTs, value: undefined });
        }

        return graphEntries;
    }

    /*public getBurndownChartUrl(boardId: number, sprintId: number): string {
        // TODO: extract to MediaController (?)
        const filename = `burndown-rapidView${boardId}-sprint${sprintId}`;
        if (existsSync(path.join(process.cwd(), 'media-gen', `${filename}.${JiraEndpointController.SCREENSHOT_FORMAT}`))) {
            return this.appState.getBaseUrl() + filename + '.' + JiraEndpointController.SCREENSHOT_FORMAT;
        }
        return undefined;
    }

    public async crawlBurndownChart(boardId: number, sprint: JiraSprint): Promise<string> {
        // TODO: extract to MediaController (?)
        const filename = `burndown-rapidView${boardId}-sprint${sprint.id}`;

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
                + `&sprint=${sprint.id}`,
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
                    sprint,
                    publicScreenshotUrl: this.appState.getBaseUrl() + result[0].filename
                })
            );

            return Promise.resolve(this.appState.getBaseUrl() + result[0].filename);
        }
        return Promise.reject(`Screenshot could not be created.`);
    }*/
}
