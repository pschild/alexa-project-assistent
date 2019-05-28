import { promisify } from 'util';
import { exec } from 'child_process';
const execAsync = promisify(exec);
import { timeout } from '../utils/testUtils';

describe('skill simulation', () => {
    beforeAll(() => {
        this.skillId = process.env.ALEXA_SKILL_ID;
        this.locale = 'de-DE';
    });

    it('can trigger JiraIssueIntent', async () => {
        let execResult: { stdout: string, stderr: string };

        const text = 'starte projektassistent';

        // invoke the skill with simulated inquiry
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

        // wait for the skill to process the simulated inquiry
        await timeout(3000);

        // check if the simulated inquiry got processed correctly
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
        expect(getSimulationResult.result.error).toBeUndefined();
        expect(getSimulationResult.result.alexaExecutionInfo.alexaResponses).toBeDefined();
        expect(getSimulationResult.result.skillExecutionInfo.invocationRequest.body.request.type).toBe('LaunchRequest');
    }, 20000);
});
