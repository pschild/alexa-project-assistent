import * as alexa from 'alexa-app';
import { buildDashboardDirective } from '../apl/datasources';

export default (request: alexa.request, response: alexa.response): void => {
    response
        .directive(buildDashboardDirective())
        .say('Triggered DisplayTestIntent');
};
