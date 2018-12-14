import * as alexa from 'alexa-app';
import { Container } from 'typescript-ioc';
import MailController from '../mail/MailController';
import AppState from '../app/state/AppState';
import EmployeeState from '../app/state/EmployeeState';
import { buildNotificationDirective, NotificationType } from '../apl/datasources';

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
    let recipientName;
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
        response.say(`${recipientName} wurde nicht in der Liste der Mitarbeiter gefunden.`);
        return;
    }

    if (!activeEmployee.email) {
        response.say(`Für ${activeEmployee.name} ist keine E-Mail-Adresse hinterlegt.`);
        return;
    } else if (!activeEmployee.enableEmail) {
        response.say(`Für ${activeEmployee.name} ist der Versand von E-Mails deaktiviert.`);
        return;
    }

    const mailContent = request.slot('MailContent');
    try {
        await controller.send(activeEmployee, mailContent);
    } catch (error) {
        response
            .directive(buildNotificationDirective({
                logoUrl: '',
                title: 'Fehler beim Senden der Mail',
                type: NotificationType.ERROR,
                textContent: {
                    primaryText: {
                        type: 'PlainText',
                        text: `E-Mail konnte nicht versendet werden`
                    }
                }
            }))
            .say(`Beim Senden der Mail ist etwas schief gelaufen.`);
        return;
    }
    response
        .directive(buildNotificationDirective({
            logoUrl: '',
            title: 'E-Mail versendet',
            type: NotificationType.SUCCESS,
            textContent: {
                primaryText: {
                    type: 'PlainText',
                    text: `An ${activeEmployee.email} versendet!`
                }
            }
        }))
        .say(`Die Mail wurde erfolgreich an ${activeEmployee.email} versendet.`);
};
