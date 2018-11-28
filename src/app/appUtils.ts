export const hasDisplaySupport = (request) => {
    return request
        && request.data
        && request.data.context
        && request.data.context.System
        && request.data.context.System.device['supportedInterfaces']
        && request.data.context.System.device['supportedInterfaces'].hasOwnProperty('Display');
};

export const wordToXSampaMap: Map<string, string> = new Map([
    ['jira', 'dZi:r6'],
    ['confluence', 'kOnfluEns'],
    ['sonarqube', 'soUnarkjub'],
    ['jenkins', '"dZEnkIns'],
    ['gitlab', 'gitlEp']
]);
