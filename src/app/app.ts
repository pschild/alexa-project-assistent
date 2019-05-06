// tslint:disable-next-line:no-var-requires
require('module-alias/register');
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as alexa from 'alexa-app';
import LaunchIntentHandler from '../handler/builtin/LaunchIntentHandler';
import StopIntentHandler from '../handler/builtin/StopIntentHandler';
import HelpIntentHandler from '../handler/builtin/HelpIntentHandler';
import JiraIssueIntentHandler from '../handler/jira/JiraIssueIntentHandler';
import JiraBurndownChartIntentHandler from '../handler/jira/JiraBurndownChartIntentHandler';
import JiraHelpIntentHandler from '../handler/jira/JiraHelpIntentHandler';
import DisplayTestIntentHandler from '../handler/DisplayTestIntentHandler';
import TimeoutHandler from '../handler/TimeoutHandler';
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
import TestIntentHandler from '../handler/TestIntentHandler';
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

app.get('/playground', (req, res) => {
    const testIntentHandler: TestIntentHandler = Container.get(TestIntentHandler);
    testIntentHandler.handle(req, res).then((x) => {
        res.send('<img src="' + x + '"/>');
    });
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

    // responseObj.directives.push(TimeoutHandler.TIMEOUT_DIRECTIVE);

    // If shouldEndSession is true, set it to undefined to make timeout work.
    // If it is explicitly set to false, do nothing to keep session open.
    if (responseObj.shouldEndSession) {
        response.shouldEndSession(undefined);
    }
};

const launchIntentHandler: LaunchIntentHandler = Container.get(LaunchIntentHandler);
const helpIntentHandler: HelpIntentHandler = Container.get(HelpIntentHandler);
const jiraHelpIntentHandler: JiraHelpIntentHandler = Container.get(JiraHelpIntentHandler);
const gitlabHelpIntentHandler: GitlabHelpIntentHandler = Container.get(GitlabHelpIntentHandler);
const sonarQubeHelpIntentHandler: SonarQubeHelpIntentHandler = Container.get(SonarQubeHelpIntentHandler);
const jiraIssueIntentHandler: JiraIssueIntentHandler = Container.get(JiraIssueIntentHandler);
const jiraChangeIssueStatusIntentHandler: JiraChangeIssueStatusIntentHandler = Container.get(JiraChangeIssueStatusIntentHandler);
const jiraXrayStatusIntentHandler: JiraXrayStatusIntentHandler = Container.get(JiraXrayStatusIntentHandler);
const jiraBurndownChartIntentHandler: JiraBurndownChartIntentHandler = Container.get(JiraBurndownChartIntentHandler);
const jiraVelocityIntentHandler: JiraVelocityIntentHandler = Container.get(JiraVelocityIntentHandler);
const jiraSprintProgressIntentHandler: JiraSprintProgressIntentHandler = Container.get(JiraSprintProgressIntentHandler);
const jiraEffortForReleaseIntentHandler: JiraEffortForReleaseIntentHandler = Container.get(JiraEffortForReleaseIntentHandler);
const timeoutHandler: TimeoutHandler = Container.get(TimeoutHandler);
const displayTestIntentHandler: DisplayTestIntentHandler = Container.get(DisplayTestIntentHandler);
const gitlabBuildStatusIntentHandler: GitLabBuildStatusIntentHandler = Container.get(GitLabBuildStatusIntentHandler);
const gitlabMergeRequestsIntentHandler: GitLabMergeRequestsIntentHandler = Container.get(GitLabMergeRequestsIntentHandler);
const sonarQubeDashboardIntentHandler: SonarQubeDashboardIntentHandler = Container.get(SonarQubeDashboardIntentHandler);
const scsDashboardIntentHandler: ScsDashboardIntentHandler = Container.get(ScsDashboardIntentHandler);
const scsHelpIntentHandler: ScsHelpIntentHandler = Container.get(ScsHelpIntentHandler);
const aplUserEventHandler: AplUserEventHandler = Container.get(AplUserEventHandler);

alexaApp.launch(launchIntentHandler.handle.bind(launchIntentHandler));

alexaApp.intent('AMAZON.StopIntent', StopIntentHandler);

// 'hilfe'
alexaApp.intent('AMAZON.HelpIntent', helpIntentHandler.handle.bind(helpIntentHandler));

// 'jira hilfe'
alexaApp.intent('JiraHelpIntent', jiraHelpIntentHandler.handle.bind(jiraHelpIntentHandler));

// 'gitlab hilfe'
alexaApp.intent('GitlabHelpIntent', gitlabHelpIntentHandler.handle.bind(gitlabHelpIntentHandler));

// 'sonarqube hilfe'
alexaApp.intent('SonarQubeHelpIntent', sonarQubeHelpIntentHandler.handle.bind(sonarQubeHelpIntentHandler));

// 'health check hilfe'
alexaApp.intent('ScsHelpIntent', scsHelpIntentHandler.handle.bind(scsHelpIntentHandler));

// 'zeige'
alexaApp.intent('DisplayTestIntent', displayTestIntentHandler.handle.bind(displayTestIntentHandler));

// 'starte projektassistent und öffne jira ticket'
alexaApp.intent('JiraIssueIntent', jiraIssueIntentHandler.handle.bind(jiraIssueIntentHandler));

// 'starte projektassistent und schließe jira ticket'
alexaApp.intent('JiraChangeIssueStatusIntent', jiraChangeIssueStatusIntentHandler.handle.bind(jiraChangeIssueStatusIntentHandler));

// 'starte projektassistent und teststatus INK 42'
alexaApp.intent('JiraXrayStatusIntent', jiraXrayStatusIntentHandler.handle.bind(jiraXrayStatusIntentHandler));

// 'starte projektassistent und zeige burndown chart'
alexaApp.intent('JiraBurndownChartIntent', jiraBurndownChartIntentHandler.handle.bind(jiraBurndownChartIntentHandler));

// 'starte projektassistent und zeige die velocity'
alexaApp.intent('JiraVelocityIntent', jiraVelocityIntentHandler.handle.bind(jiraVelocityIntentHandler));

// 'starte projektassistent und zeige den sprint fortschritt'
alexaApp.intent('JiraSprintProgressIntent', jiraSprintProgressIntentHandler.handle.bind(jiraSprintProgressIntentHandler));

// 'starte projektassistent und zeige den aufwand für das nächste release'
alexaApp.intent('JiraEffortForReleaseIntent', jiraEffortForReleaseIntentHandler.handle.bind(jiraEffortForReleaseIntentHandler));

// 'starte projektassistent und zeige build status von projekt {GitLabProjectName}'
alexaApp.intent('GitLabBuildStatusIntent', gitlabBuildStatusIntentHandler.handle.bind(gitlabBuildStatusIntentHandler));

// 'starte projektassistent und zeige merge requests'
alexaApp.intent('GitLabMergeRequestsIntent', gitlabMergeRequestsIntentHandler.handle.bind(gitlabMergeRequestsIntentHandler));

// 'starte projektassistent und zeige sonarcube übersicht von projekt {SonarQubeProjectName}'
alexaApp.intent('SonarQubeDashboardIntent', sonarQubeDashboardIntentHandler.handle.bind(sonarQubeDashboardIntentHandler));

// 'starte projektassistent und zeige teilsystem dashboard
alexaApp.intent('ScsDashboardIntent', scsDashboardIntentHandler.handle.bind(scsDashboardIntentHandler));

alexaApp.on('GameEngine.InputHandlerEvent', timeoutHandler.handle.bind(timeoutHandler));

alexaApp.on('Alexa.Presentation.APL.UserEvent', aplUserEventHandler.handle.bind(aplUserEventHandler));

app.listen(process.env.ALEXA_APP_PORT, () => console.log(`Listening on port ${process.env.ALEXA_APP_PORT}`));
