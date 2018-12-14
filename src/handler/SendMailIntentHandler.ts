import * as alexa from 'alexa-app';
import { Container } from 'typescript-ioc';
import MailController from '../mail/MailController';
import AppState from '../app/state/AppState';
import EmployeeState from '../app/state/EmployeeState';
import { buildSuccessNotification, buildErrorNotification, buildWarningNotification } from '../apl/datasources';
import { HandlerError } from '../error/HandlerError';

export default async (request: alexa.request, response: alexa.response): Promise<alexa.response> => {
    const appState: AppState = Container.get(AppState);
    const employeeState: EmployeeState = appState.getEmployeeState();
    const controller: MailController = Container.get(MailController);
    let activeEmployee = employeeState.getActive();

    // beginning of the dialog: prefill MailRecipient slot with current user (from state, if any)
    // futhermore, make sure MailContent slot is filled
    if (request.getDialog().isStarted()) {
        const updatedIntent = request.data.request.intent;
        if (activeEmployee) {
            updatedIntent.slots.MailRecipient = {
                name: 'MailRecipient',
                value: activeEmployee.name,
                confirmationStatus: 'NONE'
            };
        }
        return response
            .directive({
                type: 'Dialog.Delegate',
                updatedIntent
            })
            .shouldEndSession(false);

        // manually ensure that MailRecipient slot is filled
        // also re-ask for MailRecipient when a recipient was denied by the user
    } else if (!request.slot('MailRecipient') || request.slots.MailRecipient.confirmationStatus === 'DENIED') {
        employeeState.removeActive();
        const updatedIntent = request.data.request.intent;
        return response
            .say(`An wen soll die Mail gehen?`)
            .directive({
                type: 'Dialog.ElicitSlot',
                slotToElicit: 'MailRecipient',
                updatedIntent
            })
            .shouldEndSession(false);

        // make sure that given MailRecipient is a valid user
        // otherwise, re-ask for MailRecipient
    } else if (request.slots.MailRecipient.resolution()) {
        if (!request.slots.MailRecipient.resolution().isMatched()) {
            const updatedIntent = request.data.request.intent;
            return response
                .say(`${request.slot('MailRecipient')} kenne ich nicht. Kannst du mir den Vor und Nachnamen des Empfängers nochmal nennen?`)
                .reprompt(`Der Mitarbeiter ${request.slot('MailRecipient')} ist mir nicht bekannt. Kannst du mir den Namen nochmal sagen?`)
                .directive({
                    type: 'Dialog.ElicitSlot',
                    slotToElicit: 'MailRecipient',
                    updatedIntent
                })
                .shouldEndSession(false);
        }
    }

    // get recipient name either from local state or from slot
    let recipientName: string;
    if (!activeEmployee) {
        recipientName = request.slots.MailRecipient.resolution().values[0].name;
    } else {
        recipientName = activeEmployee.name;
    }

    // ensure confirmation of MailRecipient before actually sending the mail
    if (!request.slots.MailRecipient.isConfirmed()) {
        const updatedIntent = request.data.request.intent;
        return response
            .say(`Die Mail geht an ${recipientName}. Ist das OK?`)
            .reprompt(`Ist ${recipientName} der korrekte Empfänger?`)
            .directive({
                type: 'Dialog.ConfirmSlot',
                slotToConfirm: 'MailRecipient',
                updatedIntent
            })
            .shouldEndSession(false);
    }

    try {
        // set employee as the active one in state
        employeeState.setActive(recipientName);
        activeEmployee = employeeState.getActive();
    } catch (error) {
        throw new HandlerError(
            `${recipientName} wurde nicht in der Liste der Mitarbeiter gefunden.`,
            buildWarningNotification('Mitarbeiter nicht gefunden', `${recipientName} wurde nicht in der Liste der Mitarbeiter gefunden.`)
        );
    }

    if (!activeEmployee.email) {
        throw new HandlerError(`Für ${activeEmployee.name} ist keine E-Mail-Adresse hinterlegt.`);
    } else if (!activeEmployee.enableEmail) {
        throw new HandlerError(`Für ${activeEmployee.name} ist der Versand von E-Mails deaktiviert.`);
    }

    const mailContent = request.slot('MailContent');
    try {
        await controller.send(activeEmployee, mailContent);
    } catch (error) {
        throw new HandlerError(
            `Beim Senden der Mail ist etwas schief gelaufen.`,
            buildErrorNotification('Fehler beim Senden der Mail', 'E-Mail konnte nicht versendet werden')
        );
    }
    response
        .directive(buildSuccessNotification('E-Mail versendet', `An ${activeEmployee.email} versendet!`))
        .say(`Die Mail wurde erfolgreich an ${activeEmployee.email} versendet.`);
};
