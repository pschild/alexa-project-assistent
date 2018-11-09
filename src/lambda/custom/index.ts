import { ErrorHandler, RequestHandler, SkillBuilders, ImageHelper, HandlerInput } from "ask-sdk-core";
import { interfaces, Response, SessionEndedRequest } from "ask-sdk-model";
import * as v1adapter from "ask-sdk-v1adapter";

import Image = interfaces.display.Image;

const templateBuilders = v1adapter.templateBuilders;
const makePlainText = v1adapter.utils.TextUtils.makePlainText;

const LaunchRequestHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === "LaunchRequest";
    },
    handle(handlerInput: HandlerInput): Response {
        const speechText = "Willkommen!";

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(speechText, speechText)
            .getResponse();
    },
};

const HelloWorldIntentHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "HelloWorldIntent";
    },
    handle(handlerInput: HandlerInput): Response {
        const speechText = "Hallo Welt";

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(speechText, speechText)
            .getResponse();
    },
};

const DisplayTestIntent: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "DisplayTestIntent";
    },
    handle(handlerInput: HandlerInput): Response {
        const backgroundImage: Image = new ImageHelper()
            .withDescription("Description")
            .addImageInstance("https://www.pschild.de/full_single-57396b5bcb04847914e4c0dc0b2a4cb4.png")
            .getImage();

        const builder = new templateBuilders.BodyTemplate1Builder();
        const template = builder
            .setTitle("Title")
            .setTextContent(makePlainText("primary"), makePlainText("secondary"), makePlainText("tertiary"))
            .setBackgroundImage(backgroundImage)
            .build();

        return handlerInput.responseBuilder
            .speak("schau mal")
            .addRenderTemplateDirective(template)
            .getResponse();
    },
};

const HelpIntentHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent";
    },
    handle(handlerInput: HandlerInput): Response {
        const speechText = "Hilfe";

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(speechText, speechText)
            .getResponse();
    },
};

const CancelAndStopIntentHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && (handlerInput.requestEnvelope.request.intent.name === "AMAZON.CancelIntent"
                || handlerInput.requestEnvelope.request.intent.name === "AMAZON.StopIntent");
    },
    handle(handlerInput: HandlerInput): Response {
        const speechText = "Tschüss!";

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(speechText, speechText)
            .getResponse();
    },
};

const SessionEndedRequestHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
    },
    handle(handlerInput: HandlerInput): Response {
        console.log(`Session ended with reason: ${(handlerInput.requestEnvelope.request as SessionEndedRequest).reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler: ErrorHandler = {
    canHandle(handlerInput: HandlerInput, error: Error): boolean {
        return true;
    },
    handle(handlerInput: HandlerInput, error: Error): Response {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak("Das habe ich nicht verstanden")
            .reprompt("Das habe ich nicht verstanden")
            .getResponse();
    },
};

let skill;
export const handler = async (event, context) => {
    console.log(`REQUEST++++${JSON.stringify(event)}`);
    if (!skill) {
        skill = SkillBuilders.custom()
            .addRequestHandlers(
                LaunchRequestHandler,
                HelloWorldIntentHandler,
                DisplayTestIntent,
                HelpIntentHandler,
                CancelAndStopIntentHandler,
                SessionEndedRequestHandler,
            )
            .addErrorHandlers(ErrorHandler)
            .create();
    }

    const response = await skill.invoke(event, context);
    console.log(`RESPONSE++++${JSON.stringify(response)}`);

    return response;
};
