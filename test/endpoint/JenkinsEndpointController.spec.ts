import { Container } from 'typescript-ioc';
import { JenkinsEndpointController } from '../../src/endpoint/jenkins/JenkinsEndpointController';
import { JenkinsProject } from '../../src/endpoint/jenkins/domain/JenkinsProject';

describe('JenkinsEndpointController', () => {
    beforeAll(() => {
        this.controller = Container.get(JenkinsEndpointController);
    });

    it('can load a project', async () => {
        const project: JenkinsProject = await this.controller.getProject(process.env.JENKINS_PROJECT);

        expect(project.displayName).toBe(process.env.JENKINS_PROJECT);
    });
});
