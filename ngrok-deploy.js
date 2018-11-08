require('dotenv').config();
const ngrok = require('ngrok');
const editJsonFile = require("edit-json-file");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const runNgrok = async () => {
    console.log('Starting ngrok...');
    const url = await ngrok.connect({
        addr: process.env.ALEXA_APP_PORT,
        authtoken: process.env.NGROK_AUTHTOKEN
    }).catch(e => console.log('ERROR', e));
    console.log(`ngrok is running on ${url}!`);
    return url;
}

const updateSkillJson = async (ngrokUrl) => {
    console.log('Updating skill.json...');
    let file = editJsonFile(`${__dirname}/skill.json`);
    file.set('manifest.apis.custom.endpoint.uri', `${ngrokUrl}/${process.env.ALEXA_SKILL_NAME}`);
    file.save();
    console.log('Done!');
}

const deploySkill = async () => {
    console.log('Deploying skill...');
    const { stdout, stderr } = await exec('npm run deploy:skill');
    if (stdout) {
        console.log(stdout);
    }
    if (stderr) {
        console.log('ERROR', stderr);
    }
    console.log('Done!');
}

(async function () {
    const url = await runNgrok();
    await updateSkillJson(url);
    await deploySkill();
    console.log('Press CTRL+C to stop ngrok.');
})();
