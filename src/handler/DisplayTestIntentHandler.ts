import * as alexa from 'alexa-app';

export default (request: alexa.request, response: alexa.response): void => {
    response
        .directive({
            type: 'Display.RenderTemplate',
            template: {
                type: 'BodyTemplate1',
                backButton: 'HIDDEN',
                backgroundImage: {
                    contentDescription: '',
                    sources: [{
                        url: 'https://www.pschild.de/projects.jpg',
                        size: 'LARGE'
                    }]
                },
                textContent: {
                    primaryText: {
                        text: '<div align="center">centered</div>',
                        type: 'RichText'
                    },
                    secondaryText: {
                        text: '<action token=\'VALUE\'>clickable text</action>',
                        type: 'RichText'
                    }
                }
            }
        })
        .say('Triggered DisplayTestIntent');
};
