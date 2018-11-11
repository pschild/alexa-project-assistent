import * as alexa from 'alexa-app';

export default (request: alexa.request, response: alexa.response): void => {
    response.say(`Das ist ein Hilfe-Text`).shouldEndSession(false);
};
