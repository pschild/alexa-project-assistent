import * as alexa from 'alexa-app';

export const hasDisplaySupport = (request: alexa.request) => {
    return request
        && request.data
        && request.data.context
        && request.data.context.System
        && request.data.context.System.device['supportedInterfaces']
        && request.data.context.System.device['supportedInterfaces'].hasOwnProperty('Display');
};

export const containsDialogDirective = (response: alexa.response) => {
    const directivesOfResponse = response.response.response.directives;
    return directivesOfResponse.filter((directive) => directive.type.startsWith('Dialog.')).length > 0;
};

export const isStopIntent = (request: alexa.request) => {
    return request.data.request.type === 'IntentRequest' && request.data.request.intent.name === 'AMAZON.StopIntent';
};

export const isSessionEndedRequest = (request: alexa.request) => {
    return request.data.request.type === 'SessionEndedRequest';
};

export const excludeDisplayDirectives = (response: alexa.response) => {
    const directivesOfResponse = response.response.response.directives;
    return directivesOfResponse.filter((directive) => {
        return directive.type !== 'Display.RenderTemplate' && directive.type !== 'Alexa.Presentation.APL.RenderDocument';
    });
};

export const excludeGameEngineDirectives = (response: alexa.response) => {
    const directivesOfResponse = response.response.response.directives;
    return directivesOfResponse.filter((directive) => !directive.type.startsWith('GameEngine.'));
};

export const wordToXSampaMap: Map<string, string> = new Map([
    ['jira', 'dZi:r6'],
    ['confluence', 'kOnfluEns'],
    ['sonarqube', 'soUnarkjub'],
    ['jenkins', '"dZEnkIns'],
    ['gitlab', 'gitlEp']
]);
