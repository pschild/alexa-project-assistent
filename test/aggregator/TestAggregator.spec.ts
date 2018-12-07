import { Container } from 'typescript-ioc';
import { TestAggregator } from '../../src/aggregator/TestAggregator';

xdescribe('TestAggregator', () => {

    it('can test', async () => {
        const aggregator = Container.get(TestAggregator);
        const result = await aggregator.test();
    });
});
