import * as dotenv from 'dotenv';
import * as express from 'express';
import * as alexa from 'alexa-app';
import HelloWorldIntentHandler from '../handler/HelloWorldIntentHandler';
import LaunchIntentHandler from '../handler/LaunchIntentHandler';
import DisplayTestIntentHandler from '../handler/DisplayTestIntentHandler';
import JiraIssueIntentHandler from '../handler/JiraIssueIntentHandler';
import JenkinsBuildsIntentHandler from '../handler/JenkinsBuildsIntentHandler';
import StopIntentHandler from '../handler/StopIntentHandler';
import HelpIntentHandler from '../handler/HelpIntentHandler';

dotenv.config();

const app = express();

const alexaApp = new alexa.app(process.env.ALEXA_SKILL_NAME);

alexaApp.express({
    expressApp: app,
    checkCert: true,
    debug: true
});

alexaApp.launch(LaunchIntentHandler);
alexaApp.intent('AMAZON.HelpIntent', HelpIntentHandler);
alexaApp.intent('AMAZON.StopIntent', StopIntentHandler);

alexaApp.intent('HelloWorldIntent', HelloWorldIntentHandler);
alexaApp.intent('DisplayTestIntent', DisplayTestIntentHandler);
alexaApp.intent('JiraIssueIntent', JiraIssueIntentHandler); // 'starte informationsaggregator und öffne jira ticket'
alexaApp.intent('JenkinsBuildsIntent', JenkinsBuildsIntentHandler); // 'starte informationsaggregator und zeige jenkins status'

app.listen(process.env.ALEXA_APP_PORT, () => console.log(`Listening on port ${process.env.ALEXA_APP_PORT}`));
