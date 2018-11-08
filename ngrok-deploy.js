require('dotenv').config();
const fs = require('fs');
const ngrok = require('ngrok');
const editJsonFile = require("edit-json-file");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const tempSkillFileName = '.temp-skill.json';

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

const cleanTempFiles = async () => {
    console.log('Cleaning temporary files...');
    fs.unlinkSync(`${__dirname}/${tempSkillFileName}`);
    console.log('Done!');
}

(async function () {
    const url = await runNgrok();
    await createTempSkillJson(url);
    await deploySkill();
    await cleanTempFiles();
    console.log('Press CTRL+C to stop ngrok.');
})();
