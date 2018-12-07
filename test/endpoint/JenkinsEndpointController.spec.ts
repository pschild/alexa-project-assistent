import { Container } from 'typescript-ioc';
import { JenkinsEndpointController } from '../../src/endpoint/jenkins/JenkinsEndpointController';
import { JenkinsProject, Color } from '../../src/endpoint/jenkins/domain/JenkinsProject';

// tslint:disable-next-line:no-var-requires
const mockProject = require('../mockData/jenkins/project.json');

describe('JenkinsEndpointController', () => {
    beforeAll(() => {
        this.controller = Container.get(JenkinsEndpointController);

        // mock backend response
        spyOn(this.controller, 'get').and.returnValue(mockProject);
    });

    it('can load a project', async () => {
        const project: JenkinsProject = await this.controller.getProject('jenkins-mock-project');

        expect(project.displayName).toBe('jenkins-mock-project');
        expect(project.buildable).toBe(true);
        expect(project.color).toBe(Color.ABORTED);
        expect(project.builds.length).toBe(3);
    });
});
