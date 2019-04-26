import * as alexa from 'alexa-app';

export enum ElicitationStatus {
    SUCCESS = 'success',
    MISSING = 'missing',
    UNMATCHED = 'unmatched'
}

export enum ConfirmationStatus {
    NONE = 'none',
    CONFIRMED = 'confirmed',
    DENIED = 'denied'
}

export interface ISlotElicitationResult {
    status: ElicitationStatus;
    value?: string;
    directive?: any;
}

export interface ISlotConfirmationResult {
    status: ConfirmationStatus;
    directive?: any;
}

export const elicitSlot = (
    request: alexa.request,
    slotName: string,
    mustMatch?: boolean,
    prefilledValue?: string
): ISlotElicitationResult => {
    const updatedIntent = request.data.request.intent;
    const slot = request.slots[slotName];

    if (prefilledValue) {
        return { status: ElicitationStatus.SUCCESS, value: prefilledValue };
    }

    if (slot && slot.value) {
        if (mustMatch) {
            if (slot.resolution() && slot.resolution().isMatched()) {
                return { status: ElicitationStatus.SUCCESS, value: slot.resolution().values[0].name };
            } else {
                return {
                    status: ElicitationStatus.UNMATCHED,
                    value: slot.value,
                    directive: {
                        type: 'Dialog.ElicitSlot',
                        slotToElicit: slotName,
                        updatedIntent
                    }
                };
            }
        } else {
            if (slot.value === '?') {
                return {
                    status: ElicitationStatus.MISSING,
                    directive: {
                        type: 'Dialog.ElicitSlot',
                        slotToElicit: slotName,
                        updatedIntent
                    }
                };
            } else {
                return { status: ElicitationStatus.SUCCESS, value: slot.value };
            }
        }
    } else {
        return {
            status: ElicitationStatus.MISSING,
            directive: {
                type: 'Dialog.ElicitSlot',
                slotToElicit: slotName,
                updatedIntent
            }
        };
    }
};

export const confirmSlot = (request: alexa.request, slotName: string): ISlotConfirmationResult => {
    const updatedIntent = request.data.request.intent;
    const slot = request.slots[slotName];

    if (slot.isConfirmed()) {
        return { status: ConfirmationStatus.CONFIRMED };
    } else {
        if (slot.confirmationStatus === 'NONE') {
            return {
                status: ConfirmationStatus.NONE,
                directive: {
                    type: 'Dialog.ConfirmSlot',
                    slotToConfirm: slotName,
                    updatedIntent
                }
            };
        } else if (slot.confirmationStatus === 'DENIED') {
            return {
                status: ConfirmationStatus.DENIED,
                directive: {
                    type: 'Dialog.ElicitSlot',
                    slotToElicit: slotName,
                    updatedIntent
                }
            };
        }
    }
};
