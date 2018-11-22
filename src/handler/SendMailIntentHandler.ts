import * as alexa from 'alexa-app';
import { Container } from 'typescript-ioc';
import MailController from '../mail/MailController';
import AppState from '../app/state/AppState';

export default async (request: alexa.request, response: alexa.response): Promise<alexa.response> => {
    if (!request.getDialog().isCompleted()) {
        const updatedIntent = request.data.request.intent;
        return response
            .directive({
                type: 'Dialog.Delegate',
                updatedIntent
            })
            .shouldEndSession(false);

    }

    const mailContent = request.slot('MailContent');

    const appState: AppState = Container.get(AppState);
    const activeEmployee = appState.getEmployeeState().getActive();
    if (!activeEmployee || !activeEmployee.email || !activeEmployee.enableEmail) {
        response.say(`Kein aktiver Mitarbeiter gefunden, E-Mail nicht hinterlegt oder deaktiviert`);
        return;
    }

    const controller: MailController = Container.get(MailController);

    try {
        await controller.send(activeEmployee, mailContent);
    } catch (error) {
        response.say(`Beim Senden der Mail ist etwas schief gelaufen.`);
        return;
    }
    response.say(`Die Mail wurde erfolgreich an ${activeEmployee.email} versendet.`);
};
