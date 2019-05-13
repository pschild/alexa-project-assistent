import * as alexa from 'alexa-app';
import { post } from 'request-promise';

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

export interface IIntentConfirmationResult {
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

export const confirmIntent = (request: alexa.request): IIntentConfirmationResult => {
    const updatedIntent = request.data.request.intent;

    if (request.isConfirmed()) {
        return { status: ConfirmationStatus.CONFIRMED };
    } else {
        if (request.confirmationStatus === 'NONE') {
            return {
                status: ConfirmationStatus.NONE,
                directive: {
                    type: 'Dialog.ConfirmIntent',
                    updatedIntent
                }
            };
        } else if (request.confirmationStatus === 'DENIED') {
            return {
                status: ConfirmationStatus.DENIED
            };
        }
    }
};

export const sendProgressiveResponse = (request: alexa.request, speech: string): void => {
    // tslint:disable-next-line:no-string-literal
    const token = request.data.context.System['apiAccessToken'];
    const endpoint = request.data.context.System.apiEndpoint;
    const requestId = request.data.request.requestId;
    post({
        uri: `${endpoint}/v1/directives`,
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: {
            header: {
                requestId
            },
            directive: {
                type: 'VoicePlayer.Speak',
                speech
            }
        },
        json: true
    });
};
