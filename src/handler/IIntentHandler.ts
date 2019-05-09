import * as alexa from 'alexa-app';

export default interface IIntentHandler {
    handle(request: alexa.request, response: alexa.response): Promise<alexa.response>;
}
