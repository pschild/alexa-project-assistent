import * as dotenv from 'dotenv';
import { promisify } from 'util';
import { exec } from 'child_process';
const execAsync = promisify(exec);
import { timeout } from './utils/testUtils';

dotenv.config();

describe('skill simulation', () => {
    let originalTimeout;

    beforeAll(() => {
        this.skillId = process.env.ALEXA_SKILL_ID;
        this.locale = 'de-DE';
    });

    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('can trigger JiraIssueIntent', async () => {
        let execResult: {stdout: string, stderr: string};

        const text = 'starte informationsaggregator und öffne jira ticket';

        execResult = await execAsync(`ask api simulate-skill -t "${text}" -l ${this.locale} -s ${this.skillId}`);
        let simulateResult;
        if (execResult.stdout) {
            try {
                simulateResult = JSON.parse(execResult.stdout);
            } catch (error) {
                simulateResult = error;
            }
        }
        expect(simulateResult).toBeDefined();
        expect(simulateResult.id).toMatch(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/);
        expect(simulateResult.status).toBe('IN_PROGRESS');

        await timeout(3000);

        execResult = await execAsync(`ask api get-simulation -i ${simulateResult.id} -s ${this.skillId}`);
        let getSimulationResult;
        if (execResult.stdout) {
            try {
                getSimulationResult = JSON.parse(execResult.stdout);
            } catch (error) {
                getSimulationResult = error;
            }
        }
        expect(getSimulationResult).toBeDefined();
        expect(getSimulationResult.id).toMatch(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/);
        expect(getSimulationResult.status).toBe('SUCCESSFUL');
        expect(getSimulationResult.result).toBeDefined();
        expect(getSimulationResult.result.alexaExecutionInfo.alexaResponses).toBeDefined();
        expect(getSimulationResult.result.alexaExecutionInfo.alexaResponses.length).toBeGreaterThan(0);
        expect(getSimulationResult.result.alexaExecutionInfo.alexaResponses[0].content.caption).toBeDefined();
        expect(getSimulationResult.result.skillExecutionInfo.invocationRequest.body.request.intent.name).toBe('JiraIssueIntent');
    });
});
