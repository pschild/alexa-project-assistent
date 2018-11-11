import * as dotenv from 'dotenv';
import { JiraEndpointController } from '../src/endpoint/jira/JiraEndpointController';

dotenv.config();

describe('EndpointController', () => {
    it('can be initialized with and without parameters', () => {
        const controller = new JiraEndpointController();
        expect(controller.getBaseUrl()).toBe(process.env.JIRA_BASE_URL);
        expect(controller.getUsername()).toBe(process.env.JIRA_USERNAME);
        expect(controller.getPassword()).toBe(process.env.JIRA_PASSWORD);

        const controller1 = new JiraEndpointController('https://foo.bar/baz', 'john', 'secret!');
        expect(controller1.getBaseUrl()).toBe('https://foo.bar/baz');
        expect(controller1.getUsername()).toBe('john');
        expect(controller1.getPassword()).toBe('secret!');
    });
});
