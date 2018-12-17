import { Container } from 'typescript-ioc';
import { TestAggregator } from '../../src/aggregator/TestAggregator';
import { JiraIssueSearchResult } from '../../src/endpoint/jira/domain/JiraIssueSearchResult';

describe('TestAggregator', () => {

    it('can test', async () => {
        const aggregator = Container.get(TestAggregator);
        const result: JiraIssueSearchResult = await aggregator.tooManyOpenIssues();
    });
});
