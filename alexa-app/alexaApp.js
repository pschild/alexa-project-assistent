require('dotenv').config();
const express = require('express');
const alexa = require('alexa-app');

const app = express();

const alexaApp = new alexa.app(process.env.ALEXA_SKILL_NAME);

alexaApp.express({
    expressApp: app,
    checkCert: true,
    debug: true
});

alexaApp.launch(function(request, response) {
    response.say(`Hallo. Das ist ein Test. Wie geht es dir?`).shouldEndSession(false);
});

alexaApp.intent('AMAZON.HelpIntent', function(request, response) {
    response.say(`Das ist ein Hilfe-Text`).shouldEndSession(false);
});

alexaApp.intent('AMAZON.StopIntent', function(request, response) {
    response.say(`Auf Wiedersehen!`);
});

alexaApp.intent('HelloWorldIntent', function(request, response) {
    response.say('Triggered HelloWorldIntent');
});

alexaApp.intent('DisplayTestIntent', function(request, response) {
    response.say('Triggered DisplayTestIntent');
});

app.listen(process.env.ALEXA_APP_PORT, () => console.log('Listening on port ' + process.env.ALEXA_APP_PORT + '.'));