import * as alexa from 'alexa-app';

export default class AplUserEventHandler {

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        console.log(`Received TouchEvent, arguments: ${request.data.request.arguments}`);
        const action = request.data.request.arguments[0];
        const selectedItemIdentifier = request.data.request.arguments[1];
        if (action === 'HelpItemSelected') {
            switch (selectedItemIdentifier) {
                case 'jira':
                    return request.getRouter().intent('JiraHelpIntent');
                case 'gitlab':
                    return request.getRouter().intent('GitlabHelpIntent');
                case 'sonarqube':
                    return request.getRouter().intent('SonarQubeHelpIntent');
                case 'scs':
                    return request.getRouter().intent('ScsHelpIntent');
                default:
                    return response.say(`Diese Hilfe ist noch nicht implementiert.`);
            }
        }
    }
}
