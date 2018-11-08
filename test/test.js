require('dotenv').config();
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const simulateSkill = async () => {
    const { stdout, stderr } = await exec(`ask api simulate-skill -t "starte informationsaggregator und öffne jira ticket" -l de-DE -s ${process.env.ALEXA_SKILL_ID}`);
    if (stdout) {
        try {
            return JSON.parse(stdout);
        } catch (error) {
            throw new Error(stdout);
        }
    }
    if (stderr) {
        throw new Error(stdout);
    }
}

const getSimulation = async (simulationId) => {
    const { stdout, stderr } = await exec(`ask api get-simulation -i ${simulationId} -s ${process.env.ALEXA_SKILL_ID}`);
    if (stdout) {
        try {
            return JSON.parse(stdout);
        } catch (error) {
            throw new Error(stdout);
        }
    }
    if (stderr) {
        throw new Error(stdout);
    }
}

const timeout = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async function () {
    const simulateResult = await simulateSkill().catch(error => console.log(error.message));
    await timeout(3000);
    const getSimulationResult = await getSimulation(simulateResult.id).catch(error => console.log(error.message));
    if (getSimulationResult.status !== 'SUCCESSFUL') {
        throw new Error('Test failed.');
    }
})();