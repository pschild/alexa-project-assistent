import * as alexa from 'alexa-app';
import { buildTouchableTextDirective } from '../apl/datasources';

export default (request: alexa.request, response: alexa.response): void => {
    response
        .directive(buildTouchableTextDirective({ text: 'Click me!' }))
        .say('Triggered DisplayTestIntent');
};
