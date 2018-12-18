import { Container } from 'typescript-ioc';
import { JiraEndpointController } from '../../src/endpoint/jira/JiraEndpointController';
import { JiraIssue } from '../../src/endpoint/jira/domain/JiraIssue';
import { IssueType, IssueStatus, TestCoverageStatus, SprintStatus, SwimlaneStatus } from '../../src/endpoint/jira/domain/enum';
import { JiraSprint } from '../../src/endpoint/jira/domain/JiraSprint';
import { JiraIssueSearchResult } from '../../src/endpoint/jira/domain/JiraIssueSearchResult';

// tslint:disable-next-line:no-var-requires
const mockIssue = require('@mockData/jira/issue.json');
// tslint:disable-next-line:no-var-requires
const mockSprintsOfBoard = require('@mockData/jira/sprintsOfBoard.json');

describe('JiraEndpointController', () => {
    beforeAll(() => {
        this.controller = Container.get(JiraEndpointController);
    });

    it('can load an issue', async () => {
        spyOn(this.controller, 'get').and.returnValue(mockIssue);

        const issue: JiraIssue = await this.controller.getIssue('FOO-42');

        expect(issue.key).toBe('FOO-42');
        expect(issue.fields.issuetype.name).toBe(IssueType.BUG);

        expect(issue.fields.assignee.displayName).toBeDefined();
        expect(issue.getAssignee()).toEqual(issue.fields.assignee);

        expect(issue.fields.status.name).toBe(IssueStatus.OPEN);

        expect(issue.getOriginalEstimateSeconds()).toEqual(29000);
        expect(issue.getRemainingEstimateSeconds()).toEqual(14400);

        expect(issue.fields.labels).toEqual(['Tag1', 'Tag2', 'Tag3']);

        expect(issue.getTestCoverage()).toBeDefined();
        expect(issue.getTestCoverage().status).toBe(TestCoverageStatus.FAILED);
        expect(issue.getTestCoverage().ok).toBe(5);
        expect(issue.getTestCoverage().okPercent).toBe(23.81);
        expect(issue.getTestCoverage().getTestsSum()).toBe(5 + 9 + 7 + 0);
    });

    it('can load sprints of board', async () => {
        spyOn(this.controller, 'get').and.returnValue(mockSprintsOfBoard);

        const sprints: JiraSprint[] = await this.controller.getSprintsOfBoard(42);

        expect(sprints.length).toBe(27);
        expect(sprints.find((s) => s.id === 37).state).toBe(SprintStatus.CLOSED);
        expect(sprints.find((s) => s.id === 38).state).toBe(SprintStatus.ACTIVE);
        expect(sprints.find((s) => s.id === 39).state).toBe(SprintStatus.FUTURE);
    });

    it('can load sprints of board with filter', async () => {
        spyOn(this.controller, 'get').and.returnValue(mockSprintsOfBoard);

        await this.controller.getSprintsOfBoard(42, [SprintStatus.ACTIVE]);
        expect(this.controller.get).toHaveBeenCalledWith({
            uri: `${this.controller.getBaseUrl()}rest/agile/1.0/board/42/sprint?state=${SprintStatus.ACTIVE}`
        });

        await this.controller.getSprintsOfBoard(42, [SprintStatus.ACTIVE, SprintStatus.FUTURE]);
        expect(this.controller.get).toHaveBeenCalledWith({
            uri: `${this.controller.getBaseUrl()}rest/agile/1.0/board/42/sprint?state=${SprintStatus.ACTIVE},${SprintStatus.FUTURE}`
        });
    });

    it('can load sprint by number', async () => {
        spyOn(this.controller, 'get').and.returnValue(mockSprintsOfBoard);

        const sprint: JiraSprint = await this.controller.getSprintBySprintNumber(17);

        expect(sprint).toBeDefined();
        expect(sprint.id).toBe(36);
        expect(sprint.name).toBe('Sprint 17');
    });

    it('can load current sprint', async () => {
        const filteredMockSprintsOfBoard = Object.assign({}, mockSprintsOfBoard);
        filteredMockSprintsOfBoard.values = filteredMockSprintsOfBoard.values.filter(s => s.state === SprintStatus.ACTIVE);
        spyOn(this.controller, 'get').and.returnValue(filteredMockSprintsOfBoard);

        const sprint: JiraSprint = await this.controller.getCurrentSprint();

        expect(sprint).toBeDefined();
        expect(sprint.id).toBe(38);
        expect(sprint.name).toBe('Sprint 19');
    });

    it('can load previous sprint', async () => {
        spyOn(this.controller, 'get').and.returnValue(mockSprintsOfBoard);

        const sprint: JiraSprint = await this.controller.getPreviousSprint();

        expect(sprint).toBeDefined();
        expect(sprint.id).toBe(37);
        expect(sprint.name).toBe('Sprint 18');
    });

    it('throws error if there is no previous sprint', async () => {
        const filteredMockSprintsOfBoard = Object.assign({}, mockSprintsOfBoard);
        filteredMockSprintsOfBoard.values = filteredMockSprintsOfBoard.values.filter(s => s.state === SprintStatus.ACTIVE);
        spyOn(this.controller, 'get').and.returnValue(filteredMockSprintsOfBoard);

        let errorMessage;
        try {
            await this.controller.getPreviousSprint();
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toBe('Could not find a previous sprint');
    });
});
