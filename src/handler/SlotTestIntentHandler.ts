import * as alexa from 'alexa-app';

export default async (request: alexa.request, response: alexa.response): Promise<alexa.response> => {
    if (request.getDialog().isStarted()) {
        const updatedIntent = request.data.request.intent;
        return response
            .directive({
                type: 'Dialog.Delegate',
                updatedIntent
            })
            .shouldEndSession(false);

    } else if (!request.getDialog().isCompleted()) {
        const updatedIntent = request.data.request.intent;
        return response
            .directive({
                type: 'Dialog.Delegate',
                updatedIntent
            })
            .shouldEndSession(false);

    } else {
        const animalValue = request.slot('Animal');
        return response.say(`Du hast das Tier ${animalValue} gewählt.`);
    }

    // use this instead of Dialog.Delegate to elicit a slot
    // replaces interactionModel.prompts!
    // return response
    //     .directive({
    //         type: 'Dialog.ElicitSlot',
    //         slotToElicit: 'Animal',
    //         updatedIntent
    //     })
    //     .say(`Bitte nenne mir ein Tier!`)
    //     .shouldEndSession(false);

    // use this instead of Dialog.Delegate to confirm a slot
    // replaces interactionModel.prompts!
    // return response
    //     .directive({
    //         type: 'Dialog.ConfirmSlot',
    //         slotToConfirm: 'Animal',
    //         updatedIntent
    //     })
    //     .say(`Habe ich ${value} richtig verstanden?`)
    //     .shouldEndSession(false);
};
