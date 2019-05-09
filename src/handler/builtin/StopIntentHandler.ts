import * as alexa from 'alexa-app';
import IIntentHandler from '../IIntentHandler';

export default class StopIntentHandler implements IIntentHandler {

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        return response.say(`Tschüß und bis zum nächsten Mal!`);
    }

}
