import { Container } from 'typescript-ioc';
import { GitlabEndpointController } from '../../src/endpoint/gitlab/GitlabEndpointController';
import { GitlabProject } from '../../src/endpoint/gitlab/domain/GitlabProject';
import { GitlabMergeRequest } from '../../src/endpoint/gitlab/domain/GitlabMergeRequest';
import { MergeRequestState, MergeStatus, PipelineState } from '../../src/endpoint/gitlab/domain/enum';
import { GitlabBranch } from '../../src/endpoint/gitlab/domain/GitlabBranch';
import { GitlabPipeline } from '../../src/endpoint/gitlab/domain/GitlabPipeline';

// tslint:disable-next-line:no-var-requires
const mockProjects = require('../mockData/gitlab/projects.json');
// tslint:disable-next-line:no-var-requires
const mockMergeRequests = require('../mockData/gitlab/mergeRequests.json');
// tslint:disable-next-line:no-var-requires
const mockBranches = require('../mockData/gitlab/branches.json');
// tslint:disable-next-line:no-var-requires
const mockPipelines = require('../mockData/gitlab/pipelines.json');
// tslint:disable-next-line:no-var-requires
const mockPipeline = require('../mockData/gitlab/pipeline.json');

describe('GitlabEndpointController', () => {
    beforeAll(() => {
        this.controller = Container.get(GitlabEndpointController);
    });

    it('can load projects', async () => {
        // mock backend response
        spyOn(this.controller, 'get').and.returnValue(mockProjects);

        const projects: GitlabProject[] = await this.controller.getProjects();

        expect(projects.length).toBe(4);
        expect(projects[0].id).toBe(107);
        expect(projects[0].name).toBe('foo');
        expect(projects[0].name_with_namespace).toBe('bar / foo');
    });

    it('can load merge requests', async () => {
        // mock backend response
        spyOn(this.controller, 'get').and.returnValue(mockMergeRequests);

        const mergeRequests: GitlabMergeRequest[] = await this.controller.getAllOpenMergeRequests();

        expect(mergeRequests.length).toBe(3);

        expect(mergeRequests[0].title).toBe('WIP: [FOO-265] some description');
        expect(mergeRequests[0].state).toBe(MergeRequestState.OPENED);
        expect(mergeRequests[0].merge_status).toBe(MergeStatus.CAN_BE_MERGED);
        expect(mergeRequests[0].author.name).toBe('Doe, John');
        expect(mergeRequests[0].assignee.name).toBe('Power, Max');

        expect(mergeRequests[1].title).toBe('FOO-18: some other description');
        expect(mergeRequests[1].state).toBe(MergeRequestState.MERGED);
        expect(mergeRequests[1].merge_status).toBe(MergeStatus.CAN_BE_MERGED);
        expect(mergeRequests[1].author.name).toBe('Power, Max');
        expect(mergeRequests[1].assignee.name).toBe('Doe, John');

        expect(typeof mergeRequests[0].updated_at).toBe('object');
        expect(typeof mergeRequests[0].created_at).toBe('object');
        expect(mergeRequests[0].created_at.getDate()).toBe(22);
        expect(mergeRequests[0].created_at.getMonth()).toBe(11 - 1);
        expect(mergeRequests[0].created_at.getFullYear()).toBe(2018);
        expect(mergeRequests[0].created_at.getUTCHours()).toBe(12);
        expect(mergeRequests[0].created_at.getUTCMinutes()).toBe(41);
        expect(mergeRequests[0].created_at.getUTCSeconds()).toBe(53);
    });

    it('can group merge requests by assignee', async () => {
        const groupedMergeRequests: GitlabMergeRequest[] = this.controller.groupMergeRequestsByAssignee(mockMergeRequests);

        expect(Object.keys(groupedMergeRequests).length).toBe(2);
        expect(groupedMergeRequests['Power, Max'].length).toBe(2);
        expect(groupedMergeRequests['Doe, John'].length).toBe(1);
    });

    it('can group merge requests by author', async () => {
        const groupedMergeRequests: GitlabMergeRequest[] = this.controller.groupMergeRequestsByAuthor(mockMergeRequests);

        expect(Object.keys(groupedMergeRequests).length).toBe(2);
        expect(groupedMergeRequests['Power, Max'].length).toBe(1);
        expect(groupedMergeRequests['Doe, John'].length).toBe(2);
    });

    it('can group merge requests by project', async () => {
        const groupedMergeRequests: GitlabMergeRequest[] = this.controller.groupMergeRequestsByProject(mockMergeRequests);

        expect(Object.keys(groupedMergeRequests).length).toBe(2);
        expect(groupedMergeRequests['46'].length).toBe(1);
        expect(groupedMergeRequests['91'].length).toBe(2);
    });

    it('can load branches', async () => {
        // mock backend response
        spyOn(this.controller, 'get').and.returnValue(mockBranches);

        const branches: GitlabBranch[] = await this.controller.getBranchesOfProject(42);

        expect(branches.length).toBe(2);

        expect(branches[0].name).toBe('feature/FOO-271');
        expect(branches[0].developers_can_merge).toBe(true);
        expect(branches[0].developers_can_push).toBe(true);
        expect(branches[0].merged).toBe(true);
        expect(branches[0].protected).toBe(true);
        expect(branches[0].commit.title).toBe('Fixed some bugs');
        expect(branches[0].commit.author_name).toBe('John Doe');
        expect(branches[0].commit.committer_name).toBe('John Doe');
        expect(branches[0].commit.message).toBe('Fixed some bugs\n');
        expect(branches[0].commit.created_at.getDate()).toBe(21);
        expect(branches[0].commit.created_at.getMonth()).toBe(11 - 1);
        expect(branches[0].commit.created_at.getFullYear()).toBe(2018);
        expect(branches[0].commit.created_at.getUTCHours()).toBe(10);
        expect(branches[0].commit.created_at.getUTCMinutes()).toBe(27);
        expect(branches[0].commit.created_at.getUTCSeconds()).toBe(56);
    });

    it('can load pipelines', async () => {
        // mock backend response
        spyOn(this.controller, 'get').and.returnValue(mockPipelines);

        const pipelines: GitlabPipeline[] = await this.controller.getPipelinesOfProject(42);

        expect(pipelines.length).toBe(20);

        expect(pipelines[0].id).toBe(10880);
        expect(pipelines[0].status).toBe(PipelineState.SUCCESS);
    });

    it('can load a pipeline', async () => {
        // mock backend response
        spyOn(this.controller, 'get').and.returnValue(mockPipeline);

        const pipeline: GitlabPipeline = await this.controller.getPipeline(42, 42);

        expect(pipeline).toBeDefined();

        expect(pipeline.id).toBe(10695);
        expect(pipeline.status).toBe(PipelineState.FAILED);
        expect(pipeline.duration).toBe(425);
        expect(pipeline.ref).toBe('master');
        expect(pipeline.user.name).toBe('Doe, John');
        expect(pipeline.created_at.getDate()).toBe(5);
        expect(pipeline.created_at.getMonth()).toBe(12 - 1);
        expect(pipeline.created_at.getFullYear()).toBe(2018);
        expect(pipeline.created_at.getUTCHours()).toBe(13);
        expect(pipeline.created_at.getUTCMinutes()).toBe(29);
        expect(pipeline.created_at.getUTCSeconds()).toBe(39);
    });
});
