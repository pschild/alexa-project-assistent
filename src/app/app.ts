// tslint:disable-next-line:no-var-requires
require('module-alias/register');
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as alexa from 'alexa-app';
import LaunchIntentHandler from '../handler/builtin/LaunchIntentHandler';
import StopIntentHandler from '../handler/builtin/StopIntentHandler';
import HelpIntentHandler from '../handler/builtin/HelpIntentHandler';
import JiraBurndownChartIntentHandler from '../handler/jira/JiraBurndownChartIntentHandler';
import JiraHelpIntentHandler from '../handler/jira/JiraHelpIntentHandler';
import AppState from './state/AppState';
import { Container } from 'typescript-ioc';
import {
    hasDisplaySupport,
    containsDialogDirective,
    isStopIntent,
    excludeDisplayDirectives,
    excludeGameEngineDirectives
} from './appUtils';
import JiraXrayStatusIntentHandler from '../handler/jira/JiraXrayStatusIntentHandler';
import JiraChangeIssueStatusIntentHandler from '../handler/jira/JiraChangeIssueStatusIntentHandler';
import JiraVelocityIntentHandler from '../handler/jira/JiraVelocityIntentHandler';
import JiraSprintProgressIntentHandler from '../handler/jira/JiraSprintProgressIntentHandler';
import GitLabBuildStatusIntentHandler from '../handler/gitlab/GitLabBuildStatusIntentHandler';
import GitLabMergeRequestsIntentHandler from '../handler/gitlab/GitLabMergeRequestsIntentHandler';
import JiraEffortForReleaseIntentHandler from '../handler/jira/JiraEffortForReleaseIntentHandler';
import GitlabHelpIntentHandler from '../handler/gitlab/GitLabHelpIntentHandler';
import SonarQubeHelpIntentHandler from '../handler/sonarqube/SonarQubeHelpIntentHandler';
import SonarQubeDashboardIntentHandler from '../handler/sonarqube/SonarQubeDashboardIntentHandler';
import ScsDashboardIntentHandler from '../handler/dashboard/ScsDashboardIntentHandler';
import ScsHelpIntentHandler from '../handler/dashboard/ScsHelpIntentHandler';
import AplUserEventHandler from '../handler/builtin/AplUserEventHandler';

dotenv.config();

const appState: AppState = Container.get(AppState);

const app = express();
app.use('/static', express.static('media-static'));
app.use(express.static('media-gen'));
app.use(express.static('demo-data'));
app.use((req, res, next) => {
    appState.setHostname(req.hostname);
    return next();
});

const alexaApp = new alexa.app(process.env.ALEXA_SKILL_NAME);
alexaApp.express({
    expressApp: app,
    checkCert: true,
    debug: false
});

alexaApp.error = (exception, request, response) => {
    if (exception.directives) {
        exception.directives.map((d) => response.directive(d));
    }
    if (exception.message) {
        response.say(exception.message);
    } else {
        response.say(`Es ist ein Fehler aufgetreten.`);
    }
};

alexaApp.post = (request: alexa.request, response: alexa.response, type: string, exception: any) => {
    const responseObj = response.response.response;
    if (!hasDisplaySupport(request)) {
        responseObj.directives = excludeDisplayDirectives(response);
    }

    if (containsDialogDirective(response) || isStopIntent(request)) {
        responseObj.directives = excludeGameEngineDirectives(response);
        return;
    }

    // If shouldEndSession is true, set it to undefined to make timeout work.
    // If it is explicitly set to false, do nothing to keep session open.
    if (responseObj.shouldEndSession) {
        response.shouldEndSession(undefined);
    }
};

const launchIntentHandler: LaunchIntentHandler = Container.get(LaunchIntentHandler);
const stopIntentHandler: StopIntentHandler = Container.get(StopIntentHandler);
const helpIntentHandler: HelpIntentHandler = Container.get(HelpIntentHandler);
const jiraHelpIntentHandler: JiraHelpIntentHandler = Container.get(JiraHelpIntentHandler);
const gitlabHelpIntentHandler: GitlabHelpIntentHandler = Container.get(GitlabHelpIntentHandler);
const sonarQubeHelpIntentHandler: SonarQubeHelpIntentHandler = Container.get(SonarQubeHelpIntentHandler);
const scsHelpIntentHandler: ScsHelpIntentHandler = Container.get(ScsHelpIntentHandler);
const jiraChangeIssueStatusIntentHandler: JiraChangeIssueStatusIntentHandler = Container.get(JiraChangeIssueStatusIntentHandler);
const jiraXrayStatusIntentHandler: JiraXrayStatusIntentHandler = Container.get(JiraXrayStatusIntentHandler);
const jiraBurndownChartIntentHandler: JiraBurndownChartIntentHandler = Container.get(JiraBurndownChartIntentHandler);
const jiraVelocityIntentHandler: JiraVelocityIntentHandler = Container.get(JiraVelocityIntentHandler);
const jiraSprintProgressIntentHandler: JiraSprintProgressIntentHandler = Container.get(JiraSprintProgressIntentHandler);
const jiraEffortForReleaseIntentHandler: JiraEffortForReleaseIntentHandler = Container.get(JiraEffortForReleaseIntentHandler);
const gitlabBuildStatusIntentHandler: GitLabBuildStatusIntentHandler = Container.get(GitLabBuildStatusIntentHandler);
const gitlabMergeRequestsIntentHandler: GitLabMergeRequestsIntentHandler = Container.get(GitLabMergeRequestsIntentHandler);
const sonarQubeDashboardIntentHandler: SonarQubeDashboardIntentHandler = Container.get(SonarQubeDashboardIntentHandler);
const scsDashboardIntentHandler: ScsDashboardIntentHandler = Container.get(ScsDashboardIntentHandler);
const aplUserEventHandler: AplUserEventHandler = Container.get(AplUserEventHandler);

alexaApp.launch(launchIntentHandler.handle.bind(launchIntentHandler));

alexaApp.intent('AMAZON.StopIntent', stopIntentHandler.handle.bind(stopIntentHandler));
alexaApp.intent('AMAZON.HelpIntent', helpIntentHandler.handle.bind(helpIntentHandler));

alexaApp.intent('JiraHelpIntent', jiraHelpIntentHandler.handle.bind(jiraHelpIntentHandler));
alexaApp.intent('GitlabHelpIntent', gitlabHelpIntentHandler.handle.bind(gitlabHelpIntentHandler));
alexaApp.intent('SonarQubeHelpIntent', sonarQubeHelpIntentHandler.handle.bind(sonarQubeHelpIntentHandler));
alexaApp.intent('ScsHelpIntent', scsHelpIntentHandler.handle.bind(scsHelpIntentHandler));

alexaApp.intent('JiraChangeIssueStatusIntent', jiraChangeIssueStatusIntentHandler.handle.bind(jiraChangeIssueStatusIntentHandler));
alexaApp.intent('JiraXrayStatusIntent', jiraXrayStatusIntentHandler.handle.bind(jiraXrayStatusIntentHandler));
alexaApp.intent('JiraBurndownChartIntent', jiraBurndownChartIntentHandler.handle.bind(jiraBurndownChartIntentHandler));
alexaApp.intent('JiraVelocityIntent', jiraVelocityIntentHandler.handle.bind(jiraVelocityIntentHandler));
alexaApp.intent('JiraSprintProgressIntent', jiraSprintProgressIntentHandler.handle.bind(jiraSprintProgressIntentHandler));
alexaApp.intent('JiraEffortForReleaseIntent', jiraEffortForReleaseIntentHandler.handle.bind(jiraEffortForReleaseIntentHandler));

alexaApp.intent('GitLabBuildStatusIntent', gitlabBuildStatusIntentHandler.handle.bind(gitlabBuildStatusIntentHandler));
alexaApp.intent('GitLabMergeRequestsIntent', gitlabMergeRequestsIntentHandler.handle.bind(gitlabMergeRequestsIntentHandler));

alexaApp.intent('SonarQubeDashboardIntent', sonarQubeDashboardIntentHandler.handle.bind(sonarQubeDashboardIntentHandler));

alexaApp.intent('ScsDashboardIntent', scsDashboardIntentHandler.handle.bind(scsDashboardIntentHandler));

alexaApp.on('Alexa.Presentation.APL.UserEvent', aplUserEventHandler.handle.bind(aplUserEventHandler));

app.listen(process.env.ALEXA_APP_PORT, () => console.log(`Listening on port ${process.env.ALEXA_APP_PORT}`));
