import * as alexa from 'alexa-app';

export default (request: alexa.request, response: alexa.response): void => {
    // TODO: when AppState.firstStart === true, offer additional speech regarding possible commands (see help intent)
    response
        .say(`Hi! Wobei kann ich dir behilflich sein?`)
        .shouldEndSession(false);
};
