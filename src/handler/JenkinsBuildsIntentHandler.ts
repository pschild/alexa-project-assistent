import * as alexa from 'alexa-app';
import { Container } from 'typescript-ioc';
import { JenkinsEndpointController } from '../endpoint/jenkins/JenkinsEndpointController';
import { JenkinsProject } from '../endpoint/jenkins/domain/JenkinsProject';

export default async (request: alexa.request, response: alexa.response): Promise<void> => {
    const controller: JenkinsEndpointController = Container.get(JenkinsEndpointController);
    const project: JenkinsProject = await controller.getProject(process.env.JENKINS_PROJECT);

    response.say(`Das Projekt ${project.displayName} wurde ${project.builds.length} mal gebaut. Der aktuelle Status ist ${project.color}`);
};
