import * as alexa from 'alexa-app';

export default (request: alexa.request, response: alexa.response): void => {
    response.say(`Hallo. Das ist ein Test. Wie geht es dir?`).shouldEndSession(false);
};
