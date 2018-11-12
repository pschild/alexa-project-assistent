import { Container } from 'typescript-ioc';
import { ConfluenceEndpointController } from '../../src/endpoint/confluence/ConfluenceEndpointController';
import { ConfluenceContent } from '../../src/endpoint/confluence/domain/ConfluenceContent';

describe('ConfluenceEndpointController', () => {
    beforeAll(() => {
        this.controller = Container.get(ConfluenceEndpointController);
    });

    it('can load a page', async () => {
        const content: ConfluenceContent = await this.controller.getContent('Coding: Generelles');

        expect(content.title).toBe('Coding: Generelles');
    });
});
