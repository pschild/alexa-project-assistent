import * as alexa from 'alexa-app';
import { Container } from 'typescript-ioc';
import MailController from '../mail/MailController';
import AppState from '../app/state/AppState';
import EmployeeState from '../app/state/EmployeeState';
import { elicitSlot, ElicitationStatus, confirmSlot, ConfirmationStatus } from './utils/handlerUtils';
import { NotificationBuilder } from '../apl/NotificationBuilder';
import { HandlerError } from './error/HandlerError';

export default async (request: alexa.request, response: alexa.response): Promise<alexa.response> => {
    const appState: AppState = Container.get(AppState);
    const employeeState: EmployeeState = appState.getEmployeeState();
    let activeEmployee = employeeState.getActive();
    const controller: MailController = Container.get(MailController);

    const notificationBuilder: NotificationBuilder = Container.get(NotificationBuilder);

    const contentElicitationResult = elicitSlot(request, 'MailContent');
    if (contentElicitationResult.status === ElicitationStatus.MISSING) {
        return response
            .say(`Was soll ich dir schreiben?`)
            .directive(contentElicitationResult.directive)
            .shouldEndSession(false);
    }

    const recipientElicitationResult = elicitSlot(request, 'MailRecipient', true, activeEmployee ? activeEmployee.name : undefined);
    if (recipientElicitationResult.status !== ElicitationStatus.SUCCESS) {
        if (recipientElicitationResult.status === ElicitationStatus.MISSING) {
            response.say(`An wen soll die Mail gehen?`);
        } else if (recipientElicitationResult.status === ElicitationStatus.UNMATCHED) {
            response
                .say(`${recipientElicitationResult.value} kenne ich nicht. Kannst du mir den Vor und Nachnamen des Empfängers nochmal nennen?`)
                .reprompt(`Der Mitarbeiter ${recipientElicitationResult.value} ist mir nicht bekannt. Kannst du mir den Namen nochmal sagen?`);
        }
        return response
            .directive(recipientElicitationResult.directive)
            .shouldEndSession(false);
    }

    const recipientConfirmation = confirmSlot(request, 'MailRecipient');
    if (recipientConfirmation.status !== ConfirmationStatus.CONFIRMED) {
        if (recipientConfirmation.status === ConfirmationStatus.NONE) {
            response
                .say(`Die Mail geht an ${recipientElicitationResult.value}. Ist das OK?`)
                .reprompt(`Ist ${recipientElicitationResult.value} der korrekte Empfänger?`);
        } else if (recipientConfirmation.status === ConfirmationStatus.DENIED) {
            employeeState.removeActive();
            response.say(`Okay. An wen soll die Mail dann gehen?`);
        }
        return response
            .directive(recipientConfirmation.directive)
            .shouldEndSession(false);
    }

    try {
        employeeState.setActive(recipientElicitationResult.value);
        activeEmployee = employeeState.getActive();
    } catch (error) {
        throw new HandlerError(
            `${recipientElicitationResult.value} wurde nicht in der Liste der Mitarbeiter gefunden.`,
            notificationBuilder.buildWarningNotification(
                `${recipientElicitationResult.value} wurde nicht in der Liste der Mitarbeiter gefunden.`
            )
        );
    }

    if (!activeEmployee.email) {
        throw new HandlerError(
            `Für ${activeEmployee.name} ist keine E-Mail-Adresse hinterlegt.`,
            notificationBuilder.buildWarningNotification(`Für ${activeEmployee.name} ist keine E-Mail-Adresse hinterlegt.`)
        );
    } else if (!activeEmployee.enableEmail) {
        throw new HandlerError(
            `Für ${activeEmployee.name} ist der Versand von E-Mails deaktiviert.`,
            notificationBuilder.buildWarningNotification(`Für ${activeEmployee.name} ist der Versand von E-Mails deaktiviert.`)
        );
    }

    try {
        await controller.send(activeEmployee, contentElicitationResult.value);
    } catch (error) {
        throw new HandlerError(
            `Beim Senden der Mail ist etwas schief gelaufen.`,
            notificationBuilder.buildErrorNotification('E-Mail konnte nicht versendet werden')
        );
    }
    response
        .directive(notificationBuilder.buildSuccessNotification(`An ${activeEmployee.email} versendet!`))
        .say(`Die Mail wurde erfolgreich an ${activeEmployee.email} versendet.`);
};
