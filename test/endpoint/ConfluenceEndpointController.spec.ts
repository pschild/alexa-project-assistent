import { Container } from 'typescript-ioc';
import { ConfluenceEndpointController } from '../../src/endpoint/confluence/ConfluenceEndpointController';
import { ConfluenceContent } from '../../src/endpoint/confluence/domain/ConfluenceContent';

describe('ConfluenceEndpointController', () => {
    beforeAll(() => {
        this.controller = Container.get(ConfluenceEndpointController);

        // mock backend response
        spyOn(this.controller, 'get').and.returnValue({
            results: [
                {
                    id: '4711',
                    type: 'page',
                    status: 'current',
                    title: 'Foobar Title',
                    body: {
                        view: {
                            value: 'Lorem ipsum dolor sit amet.'
                        }
                    }
                }
            ]
        });
    });

    it('can load a page', async () => {
        const content: ConfluenceContent = await this.controller.getContent('Foobar Title');

        expect(content.id).toBe('4711');
        expect(content.title).toBe('Foobar Title');
        expect(content.body.view.value).toBe('Lorem ipsum dolor sit amet.');
    });
});
