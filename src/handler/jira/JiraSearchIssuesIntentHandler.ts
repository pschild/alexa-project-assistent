import * as alexa from 'alexa-app';
import { Container } from 'typescript-ioc';
import { JiraEndpointController } from '../../endpoint/jira/JiraEndpointController';
import { JiraIssueSearchResult } from '../../endpoint/jira/domain/JiraIssueSearchResult';
import { JiraIssue } from '../../endpoint/jira/domain/JiraIssue';
import { IssuePriority } from '../../endpoint/jira/domain/enum';
import { sayInEnglish } from '../utils/speechUtils';

export default async (request: alexa.request, response: alexa.response): Promise<alexa.response> => {
    const controller: JiraEndpointController = Container.get(JiraEndpointController);

    const result: JiraIssueSearchResult = await controller.searchIssues();
    const highestPriority = result.issues.filter((issue: JiraIssue) => {
        return issue.fields.priority
            && (issue.fields.priority.name === IssuePriority.HIGHEST || issue.fields.priority.name === IssuePriority.HIGH);
    }).length;

    return response
        .say(`Es gibt insgesamt ${result.total} offene ${sayInEnglish('Bugs')}, die niemandem zugewiesen sind.`)
        .say(`${highestPriority} davon mit höchster oder hoher Priorität.`);
};
