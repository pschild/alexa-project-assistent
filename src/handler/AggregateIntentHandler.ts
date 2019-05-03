import * as alexa from 'alexa-app';
import { TestAggregator } from '../aggregator/TestAggregator';
import { Container } from 'typescript-ioc';
import { sayAsDecimal, sayInEnglish } from './utils/speechUtils';

export default async (request: alexa.request, response: alexa.response): Promise<alexa.response> => {
    const aggregator: TestAggregator = Container.get(TestAggregator);

    const result = await aggregator.getCurrentSprintStats();
    const {remainingHours, todoBugs, todoAndDoingIssues, doneIssesPerHour, todoAndDoingIssuesPerHour, sumOfRemainingSeconds} = result;
    return response.say(
        `Es sind noch ca. ${Math.ceil(remainingHours)} Stunden verbleibend im aktuellen Sprint, `
        + `geschätzt sind noch ${sumOfRemainingSeconds / 3600} Stunden offen. `
        + `Es gibt noch ${todoAndDoingIssues} unerledigte Tickets, davon sind ${todoBugs} ${sayInEnglish('Bugs')}. `
        + `Bisher wurden ${sayAsDecimal(doneIssesPerHour.toFixed(2))} Tickets pro Stunde erledigt. `
        + `Um das Sprintziel zu erreichen, müssten ${sayAsDecimal(todoAndDoingIssuesPerHour.toFixed(2))} Tickets pro Stunde erledigt werden.`
    );
};
