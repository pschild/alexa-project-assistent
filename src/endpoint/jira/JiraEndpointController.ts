import { EndpointController } from '../EndpointController';
import { plainToClass } from 'class-transformer';
import { JiraIssue } from './domain/JiraIssue';
import { AutoWired, Singleton } from 'typescript-ioc';
// import * as Pageres from 'Pageres';
// import * as path from 'path';
// import { existsSync } from 'fs';
// import { NotificationType, Notification } from '../../app/state/NotificationState';
import { IssueType, IssueStatus, SprintStatus, IssueTransitionStatus } from './domain/enum';
import { JiraIssueSearchResult } from './domain/JiraIssueSearchResult';
import { JiraSprint } from './domain/JiraSprint';
import { JiraTestRun } from './domain/JiraTestRun';

@AutoWired
@Singleton
export class JiraEndpointController extends EndpointController {

    public static API_VERSION: number = 2;

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

    public async changeIssueStatus(identifier: string, newStatus: IssueTransitionStatus): Promise<any> {
        return await this.post({
            uri: `${this.baseUrl}rest/api/${JiraEndpointController.API_VERSION}/issue/${identifier}/transitions`,
            body: {
                transition: {
                    id: newStatus
                }
            }
        });
    }

    public async getBurndownData(rapidViewId: number, sprintId: number): Promise<any> {
        const result = await this.get({
            uri: `${this.baseUrl}rest/greenhopper/1.0/rapid/charts/scopechangeburndownchart.json`
                + `?rapidViewId=${rapidViewId}&sprintId=${sprintId}&statisticFieldId=field_timeestimate`
        });

        return this.parseBurndownChartData(result);
    }

    private parseBurndownChartData(data) {
        const sprintStartTs = data.startTime;
        const nowTs = data.now;
        const sprintCompleteTs = data.completeTime;
        const sprintEndTs = data.endTime;

        const keyTimeMap = [];
        for (const ts of Object.keys(data.changes)) {
            const entries = data.changes[ts];
            entries.forEach(entry => {
                if (+ts < sprintStartTs) {
                    const existingEntry = keyTimeMap.find(e => e.key === entry.key);
                    if (existingEntry) {
                        if (entry.timeC) {
                            existingEntry.time = entry.timeC.newEstimate;
                        }
                    } else {
                        keyTimeMap.push({
                            key: entry.key,
                            time: entry.timeC ? entry.timeC.newEstimate : 0,
                            added: false
                        });
                    }
                }
            });
        }
        // console.log(keyTimeMap);

        const burndownData = [];
        let rte = 0;
        let sprintStartRte = 0;
        let sprintCompleteRte = 0;
        let afterStart = false;
        let afterComplete = false;
        for (const ts of Object.keys(data.changes)) {
            if (+ts >= sprintStartTs && !afterStart) {
                console.log('SPRINT START');
                afterStart = true;
                sprintStartRte = rte;
                burndownData.push({ key: sprintStartTs, value: rte });
            } else if (+ts >= sprintCompleteTs && !afterComplete) {
                console.log('SPRINT COMPLETE');
                afterComplete = true;
                sprintCompleteRte = rte;
                burndownData.push({ key: sprintCompleteTs, value: rte });
            }
            const entries = data.changes[ts];
            entries.forEach(entry => {
                const fromMap = keyTimeMap.find(e => e.key === entry.key);
                if (fromMap) {
                    if (entry.added === true && fromMap.added === false) {
                        rte += fromMap.time;
                        fromMap.added = true;
                        if (afterStart && !afterComplete) {
                            burndownData.push({ key: +ts, value: rte });
                        }
                        console.log(`added ${entry.key} to sprint: ${fromMap.time}\trte=${rte}`);
                    } else if (entry.added === false && fromMap.added === true) {
                        rte -= fromMap.time;
                        fromMap.added = false;
                        if (afterStart && !afterComplete) {
                            burndownData.push({ key: +ts, value: rte });
                        }
                        console.log(`removed ${entry.key} from sprint: -${fromMap.time}\trte=${rte}`);
                    } else if (entry.timeC) {
                        const newEstimate = entry.timeC.newEstimate || 0;
                        const oldEstimate = entry.timeC.oldEstimate || 0;
                        if (fromMap.added === true) {
                            const diff = newEstimate - oldEstimate;
                            rte += diff;
                            if (afterStart && !afterComplete) {
                                burndownData.push({ key: +ts, value: rte });
                            }
                            console.log(`changed ${entry.key}: ${diff}\trte=${rte}`);
                        }
                        fromMap.time = newEstimate;
                    }
                } else {
                    console.log(`added ${entry.key} AFTER sprint started`);
                    if (entry.timeC) {
                        const time = entry.timeC.newEstimate || 0;
                        let isAdded = false;
                        if (entry.added === true) {
                            isAdded = true;
                            rte += time;
                            if (afterStart && !afterComplete) {
                                burndownData.push({ key: +ts, value: rte });
                            }
                            console.log(`added ${entry.key} to sprint: ${time}\trte=${rte}`);
                        }
                        keyTimeMap.push({
                            key: entry.key,
                            time,
                            added: isAdded
                        });
                    } else if (entry.added === true) {
                        keyTimeMap.push({
                            key: entry.key,
                            time: 0,
                            added: true
                        });
                    }
                }
            });
        }

        if (sprintCompleteTs) {
            burndownData.push({ key: sprintCompleteTs, value: sprintCompleteRte });
            burndownData.push({ key: sprintCompleteTs, value: undefined });
            burndownData.push({ key: sprintEndTs, value: undefined });
        } else {
            burndownData.push({ key: nowTs, value: rte });
            burndownData.push({ key: nowTs, value: undefined });
            burndownData.push({ key: sprintEndTs, value: undefined });
        }

        const idealData = [
            { key: sprintStartTs, value: sprintStartRte },
            { key: sprintEndTs, value: 0 }
        ];

        return { burndownData, idealData };
    }
}
