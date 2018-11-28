# Installation
1. `ask new`
2. Renamed en-US.json to de-DE.json and changed `invocationName`
3. Changed `locales` to de-DE in `skill.json`

# Development
* `npm run dev` starts the express server and watches for changes
    * Easiest way to develop is to start `npm run dev` in a shell and `deploy:ngrok` in _another_ shell.

# Deployment
1. Deploy with lambda function: `npm run deploy`
    * Compiles TypeScript to JavaScript (`lambda/dist`)
    * Copies the `package.json` file to `dist` folder and removes `devDependencies` property
    * Installs the npm packages in `dist` folder based on newly created `package.json`
    * Deploys to AWS with ASK CLI (model, skill and lambda)
2. Deploy local `alexa-app` using `ngrok`: `npm start`
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
* https://github.com/sindresorhus/pageres