import * as alexa from 'alexa-app';
import { Container } from 'typescript-ioc';
import MailController from '../mail/MailController';

export default async (request: alexa.request, response: alexa.response): Promise<void> => {
    const controller: MailController = Container.get(MailController);

    try {
        await controller.send();
    } catch (error) {
        response.say(`Beim Senden der Mail ist etwas schief gelaufen.`);
        return;
    }
    response.say(`Die Mail wurde erfolgreich versendet.`);
};
