import * as alexa from 'alexa-app';

export default (request: alexa.request, response: alexa.response): void => {
    response.say(`Tschüß und bis zum nächsten Mal!`);
};
