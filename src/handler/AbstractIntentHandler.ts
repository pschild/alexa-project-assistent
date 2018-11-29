import * as alexa from 'alexa-app';
import * as Speech from 'ssml-builder';

export abstract class AbstractIntentHandler {

    protected speech: Speech;
    protected session: alexa.session;
    protected hasError: boolean;

    protected outputDirectives: any[] = [];

    constructor() {
        this.resetSpeech();
        this.resetDirectives();
        this.resetError();
    }

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        this.resetSpeech();
        this.resetError();
        this.resetDirectives();
        this.session = request.getSession();
        return this.handleSpecificIntent(request, response);
    }

    protected abstract async handleSpecificIntent(request: alexa.request, response: alexa.response): Promise<alexa.response>;

    protected resetSpeech() {
        this.speech = new Speech();
    }

    protected resetDirectives() {
        this.outputDirectives = [];
    }

    protected addDirective(directive: any) {
        this.outputDirectives = [...this.outputDirectives, directive];
    }

    protected resetError() {
        this.hasError = false;
    }

}
