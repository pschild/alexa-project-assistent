# Prerequisites
* Install Node including npm. Tested with node 10.15.3 and npm 6.4.1
* Install Python. Ensure it's added to your PATH. Tested with Python 2.7, which was included in `windows-build-tools` via `npm install -g --production windows-build-tools` (Admin Terminal)
* Install ASK-CLI: `npm install -g ask-cli`
* Call `ask init` to initialize the CLI. You need to have a developer account for Amazon. The connection to an AWS profile can be skipped by answering the question with `n`/`no`. For further information, follow the official [documentation](https://developer.amazon.com/de/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html#step-3-install-and-initialize-ask-cli)
* Make sure you have access to Jira, GitLab and SonarQube.

# Installation
1. `npm install`
2. Copy `.env.template` to `.env` and provide credentials, URLs etc.
   * The value for `NGROK_AUTHTOKEN` can be found in the file `C:\Users\%USERNAME%\.ngrok2\ngrok.yml` (on Windows)

# Development & Deployment
* `npm run deploy:ngrok` deploys the skill to Amazons AVS and runs ngrok server
* `npm run server:start` compiles the TypeScript code and runs the local server
* `npm start` runs `deploy:ngrok` and `server:start` concurrently
* `npm run dev` starts the local express server and watches for changes
  * Easiest way to develop is to start `npm run dev` in a shell and `npm run deploy:ngrok` in _another_ shell.
* `npm test` runs tests (at the moment only the invocation of the skill will be tested)

# Features
* Jira
  * `JiraHelpIntent`: Opens the help for Jira
  * `JiraChangeIssueStatusIntent`: Changes the status of a Jira issue to `done` or `in progress`
  * `JiraXrayStatusIntent`: Shows the status of Xray tests in Jira
  * `JiraBurndownChartIntent`: Shows the burndown chart of a sprint
  * `JiraVelocityIntent`: Shows the velocity of previous sprints and calculates it for the next one
  * `JiraSprintProgressIntent`: Shows information about the progress of the current sprint
  * `JiraEffortForReleaseIntent`: Shows how much effort needs to be done until the next release
* GitLab
  * `GitlabHelpIntent`: Opens the help for GitLab
  * `GitLabBuildStatusIntent`: Shows current status of CI pipelines
  * `GitLabMergeRequestsIntent`: Shows open merge requests of all projects
* SonarQube
  * `SonarQubeHelpIntent`: Opens the help for SonarQube
  * `SonarQubeDashboardIntent`: Shows code quality of a project or multiple projects
* Health Check
  * `ScsHelpIntent`: Opens the help for Health Check
  * `ScsDashboardIntent`: Shows information/status from multiple systems in one dashboard

# Demo
An Echo device as well as access to the systems Jira, GitLab and SonarQube will be needed to use the app, so a real demo without any of those cannot be provided.  
However, you can test the generation of some charts, based on demo data:
1. Run `npm run dev` or `npm run server:start`
2. Generate a...
   * Burndown Chart, by calling `http://localhost:4242/demo/burndownchart`
   * Velocity Chart, by calling `http://localhost:4242/demo/velocity`

# Links to libraries
* https://github.com/alexa-js/alexa-app
* https://github.com/mandnyc/ssml-builder
* https://github.com/typestack/class-transformer
* https://github.com/thiagobustamante/typescript-ioc
* https://github.com/d3-node/d3-node
* https://github.com/domenic/svg2png
* https://github.com/motdotla/dotenv
* https://github.com/felixge/node-dateformat
* https://github.com/EvanHahn/HumanizeDuration.js
* https://github.com/bubenshchykov/ngrok
* https://nodemon.io
* https://github.com/IonicaBizau/edit-json-file
* https://github.com/kimmobrunfeldt/concurrently