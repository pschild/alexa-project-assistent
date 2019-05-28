import * as alexa from 'alexa-app';
import IIntentHandler from './IIntentHandler';

export default class DisplayTestIntentHandler implements IIntentHandler {

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        return response
            .say('Test');
    }
}
