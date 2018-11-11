import * as alexa from 'alexa-app';
import { get } from 'request-promise';

export default async (request: alexa.request, response: alexa.response): Promise<void> => {
    const result = await get({
        url: `${process.env.JENKINS_URL}/job/${process.env.JENKINS_PROJECT}/api/${process.env.JENKINS_FORMAT}`,
        auth: {
            username: process.env.JENKINS_USERNAME,
            password: process.env.JENKINS_API_TOKEN
        },
        json: true
    });
    response.say(`Das Projekt ${result.name} wurde ${result.builds.length} mal gebaut. Der aktuelle Status ist ${result.color}`);
};
