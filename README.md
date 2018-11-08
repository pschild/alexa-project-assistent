# Installation
1. `ask new`
2. Renamed en-US.json to de-DE.json and changed `invocationName`
3. Changed `locales` to de-DE in `skill.json`

# Deployment
1. Deploy with lambda function: `npm run deploy`
    * Compiles TypeScript to JavaScript (`lambda/dist`)
    * Copies the `package.json` file to `dist` folder and removes `devDependencies` property
    * Installs the npm packages in `dist` folder based on newly created `package.json`
    * Deploys to AWS with ASK CLI (model, skill and lambda)
2. Deploy local `alexa-app` using `ngrok`: `npm start`
    * Runs ngrok, updates `skill.json` with accoring URL, deploys the skill (using `concurrently`)
    * Starts the `express` server (using `concurrently`)