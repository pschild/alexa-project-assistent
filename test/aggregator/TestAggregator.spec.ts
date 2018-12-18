import { Container } from 'typescript-ioc';
import { TestAggregator } from '../../src/aggregator/TestAggregator';
import { JiraEndpointController } from '../../src/endpoint/jira/JiraEndpointController';
import { SprintStatus } from '../../src/endpoint/jira/domain/enum';
import { plainToClass } from 'class-transformer';
import { JiraSprint } from '../../src/endpoint/jira/domain/JiraSprint';
import { JiraIssue } from '../../src/endpoint/jira/domain/JiraIssue';

// tslint:disable-next-line:no-var-requires
const mockSprintsOfBoard = require('@mockData/jira/sprintsOfBoard.json');
// tslint:disable-next-line:no-var-requires
const mockIssuesOfSprint = require('@mockData/jira/issuesOfSprint.json');

describe('TestAggregator', () => {
    beforeAll(() => {
        this.aggregator = Container.get(TestAggregator);
    });

    beforeEach(() => {
        jasmine.clock().install();
    });

    it('can get stats of current sprint', async () => {
        const filteredMockSprintsOfBoard = Object.assign({}, mockSprintsOfBoard);
        filteredMockSprintsOfBoard.values = filteredMockSprintsOfBoard.values.filter(s => s.state === SprintStatus.ACTIVE);
        const mockCurrentSprint = plainToClass(JiraSprint, filteredMockSprintsOfBoard.values[0]);
        spyOn(JiraEndpointController.prototype, 'getCurrentSprint').and.returnValue(mockCurrentSprint);

        mockIssuesOfSprint.issues = mockIssuesOfSprint.issues.map((issue) => plainToClass(JiraIssue, issue));
        spyOn(JiraEndpointController.prototype, 'getIssuesOfSprint').and.returnValue(mockIssuesOfSprint);

        const sprintEndDate = new Date(2018, 11, 17, 10, 29, 0);
        jasmine.clock().mockDate(sprintEndDate);

        const result = await this.aggregator.getCurrentSprintStats();

        expect(result.remainingHours).toBeCloseTo(48);
        expect(result.todoBugs).toBe(1);
        expect(result.todoAndDoingIssues).toBe(86);
        expect(result.doneIssesPerHour).toBeCloseTo(0.26);
        expect(result.todoAndDoingIssuesPerHour).toBeCloseTo(0.35);
        expect(result.sumOfRemainingSeconds).toBe(381767);
    });
});
