import * as dotenv from "dotenv";
import * as express from "express";
import * as alexa from "alexa-app";

dotenv.config();

const app = express();

const alexaApp = new alexa.app(process.env.ALEXA_SKILL_NAME);

alexaApp.express({
    expressApp: app,
    checkCert: true,
    debug: true
});

alexaApp.launch((request, response) => {
    response.say(`Hallo. Das ist ein Test. Wie geht es dir?`).shouldEndSession(false);
});

alexaApp.intent("AMAZON.HelpIntent", (request, response) => {
    response.say(`Das ist ein Hilfe-Text`).shouldEndSession(false);
});

alexaApp.intent("AMAZON.StopIntent", (request, response) => {
    response.say(`Auf Wiedersehen!`);
});

alexaApp.intent("HelloWorldIntent", (request, response) => {
    response.say("Triggered HelloWorldIntent");
});

alexaApp.intent("DisplayTestIntent", (request, response) => {
    response.say("Triggered DisplayTestIntent");
});

app.listen(process.env.ALEXA_APP_PORT, () => console.log("Listening on port " + process.env.ALEXA_APP_PORT + "."));
