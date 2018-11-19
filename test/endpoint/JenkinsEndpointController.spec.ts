import { Container } from 'typescript-ioc';
import { JenkinsEndpointController } from '../../src/endpoint/jenkins/JenkinsEndpointController';
import { JenkinsProject, Color } from '../../src/endpoint/jenkins/domain/JenkinsProject';

describe('JenkinsEndpointController', () => {
    beforeAll(() => {
        this.controller = Container.get(JenkinsEndpointController);

        // mock backend response
        spyOn(this.controller, 'get').and.returnValue({
            displayName: 'jenkins-mock-project',
            buildable: true,
            builds: [
                {
                    _class: 'hudson.model.FreeStyleBuild',
                    number: 3,
                    url: 'http://jenkins/job/jenkins-mock-project/3/'
                },
                {
                    _class: 'hudson.model.FreeStyleBuild',
                    number: 2,
                    url: 'http://jenkins/job/jenkins-mock-project/2/'
                },
                {
                    _class: 'hudson.model.FreeStyleBuild',
                    number: 1,
                    url: 'http://jenkins/job/jenkins-mock-project/1/'
                }
            ],
            color: 'aborted'
        });
    });

    it('can load a project', async () => {
        const project: JenkinsProject = await this.controller.getProject('jenkins-mock-project');

        expect(project.displayName).toBe('jenkins-mock-project');
        expect(project.buildable).toBe(true);
        expect(project.color).toBe(Color.ABORTED);
        expect(project.builds.length).toBe(3);
    });
});
