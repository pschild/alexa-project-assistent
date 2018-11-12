import * as dotenv from 'dotenv';
import { JiraEndpointController } from '../../src/endpoint/jira/JiraEndpointController';
import { Container } from 'typescript-ioc';

dotenv.config();

describe('EndpointController', () => {

    afterEach(() => {
        Container.get(JiraEndpointController).config();
    });

    it('can be initialized without parameters', () => {
        const controller = Container.get(JiraEndpointController);

        expect(controller.getBaseUrl()).toBe(process.env.JIRA_BASE_URL);
        expect(controller.getUsername()).toBe(process.env.JIRA_USERNAME);
        expect(controller.getPassword()).toBe(process.env.JIRA_PASSWORD);
    });

    it('can be initialized with parameters', () => {
        const controller = Container.get(JiraEndpointController);
        controller.config('https://foo.bar/baz', 'john', 'secret!');

        expect(controller.getBaseUrl()).toBe('https://foo.bar/baz');
        expect(controller.getUsername()).toBe('john');
        expect(controller.getPassword()).toBe('secret!');
    });
});
