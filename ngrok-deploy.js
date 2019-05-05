require('module-alias/register');
require('dotenv').config();
const fs = require('fs');
const ngrok = require('ngrok');
const editJsonFile = require('edit-json-file');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const employeeList = require('@root/demo-data/employees.json');
const scsList = require('@root/demo-data/scs.json');

const tempSkillFileName = '.temp-skill.json';
const tempModelFileName = '.temp-model.json';

const runNgrok = async () => {
    console.log('Starting ngrok...');
    const url = await ngrok.connect({
        addr: process.env.ALEXA_APP_PORT,
        authtoken: process.env.NGROK_AUTHTOKEN
    }).catch(e => console.log('ERROR', e));
    console.log(`ngrok is running on ${url}!`);
    return url;
}

const createTempSkillJson = async (ngrokUrl) => {
    console.log(`Generating ${tempSkillFileName}...`);
    fs.copyFileSync(`${__dirname}/skill.json`, `${__dirname}/${tempSkillFileName}`);
    let file = editJsonFile(`${__dirname}/${tempSkillFileName}`);
    file.set('manifest.apis.custom.endpoint.uri', `${ngrokUrl}/${process.env.ALEXA_SKILL_NAME}`);
    file.save();
    console.log('Done!');
}

const createTempModelJson = async () => {
    console.log(`Generating ${tempModelFileName}...`);
    fs.copyFileSync(`${__dirname}/models/de-DE.json`, `${__dirname}/${tempModelFileName}`);
    let file = editJsonFile(`${__dirname}/${tempModelFileName}`);

    // type EmployeeName
    let employeeNameType = file.get('interactionModel.languageModel.types').find((type) => type.name === 'EmployeeName');
    if (!employeeNameType) {
        throw new Error(`Could not find type "EmployeeName" in model`);
    }
    employeeNameType.values = employeeList.map(employee => {
        return { name: { value: employee.name } };
    });

    // type GitLabProject
    let gitlabProjectType = file.get('interactionModel.languageModel.types').find((type) => type.name === 'GitLabProject');
    if (!gitlabProjectType) {
        throw new Error(`Could not find type "GitLabProject" in model`);
    }
    gitlabProjectType.values = scsList.map(scs => {
        return { id: scs.gitlabId, name: { value: scs.name } };
    });

    // type SonarQubeProject
    let sonarQubeProjectType = file.get('interactionModel.languageModel.types').find((type) => type.name === 'SonarQubeProject');
    if (!sonarQubeProjectType) {
        throw new Error(`Could not find type "SonarQubeProject" in model`);
    }
    sonarQubeProjectType.values = scsList.map(scs => {
        return { id: scs.sonarqubeKey, name: { value: scs.name } };
    });

    file.save();
    console.log('Done!');
}

const deploySkill = async () => {
    console.log('Deploying skill...');
    const { stdout, stderr } = await exec(`ask api update-skill -s ${process.env.ALEXA_SKILL_ID} -f ${tempSkillFileName}`);
    if (stdout) {
        console.log(stdout);
    }
    if (stderr) {
        console.log('ERROR', stderr);
    }
    console.log('Done!');
}

const deployModel = async () => {
    console.log('Deploying model...');
    const { stdout, stderr } = await exec(`ask api update-model -s ${process.env.ALEXA_SKILL_ID} -f ${tempModelFileName} -l de-DE`);
    if (stdout) {
        console.log(stdout);
    }
    if (stderr) {
        console.log('ERROR', stderr);
    }
    console.log('Done!');
}

const cleanTempFiles = async () => {
    console.log('Cleaning temporary files...');
    fs.unlinkSync(`${__dirname}/${tempSkillFileName}`);
    fs.unlinkSync(`${__dirname}/${tempModelFileName}`);
    console.log('Done!');
}

(async function () {
    try {
        const url = await runNgrok();
        await createTempSkillJson(url);
        await createTempModelJson();
        await deploySkill();
        await deployModel();
    } catch (error) {
        await ngrok.kill();
        throw new Error(error.message);
    } finally {
        await cleanTempFiles();
    }
    console.log('Press CTRL+C to stop ngrok.');
})();
