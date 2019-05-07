# Prerequisites
* Install Node including npm. Tested with node 10.15.3 and npm 6.4.1
* Install Python. Ensure it's added to your PATH. Tested with Python 2.7, which was included in `windows-build-tools` via `npm install -g --production windows-build-tools` (Admin Terminal)
* Install ASK-CLI: `npm install -g ask-cli`, followed by `ask init`. The connection to an AWS profile can be skipped by answering the question with n/no. For further information, follow the official [documentation](https://developer.amazon.com/de/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html#step-3-install-and-initialize-ask-cli)

# Installation
1. `git clone https://github.com/pschild/pm-info-aggregator.git`
2. `npm install`
3. Copy `.env.template` to `.env` and provide credentials, urls etc.
   * The value for `NGROK_AUTHTOKEN` can be found in the file `C:\Users\%USERNAME%\.ngrok2\ngrok.yml`
4. 

# Development
* `npm run deploy:ngrok` deploys the skill to Amazon and runs ngrok server
* `npm run dev` starts the express server and watches for changes
    * Easiest way to develop is to start `npm run dev` in a shell and `npm run deploy:ngrok` in _another_ shell.
* `npm test` runs tests

# Deployment
1. Deploy local `alexa-app` using `ngrok`: `npm start`
    * using `concurrently`:
        * Runs ngrok, receives its URL and deploys the skill with a temporary JSON file, containing the ngrok URL
        * Starts the `express` server

# Important used libraries
* https://github.com/alexa-js/alexa-app
* https://github.com/mandnyc/ssml-builder
* https://github.com/typestack/class-transformer
* https://github.com/thiagobustamante/typescript-ioc
* https://github.com/motdotla/dotenv
* https://github.com/bubenshchykov/ngrok
* https://github.com/EvanHahn/HumanizeDuration.js