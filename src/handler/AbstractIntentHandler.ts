import * as alexa from 'alexa-app';
import * as Speech from 'ssml-builder';
import { Inject } from 'typescript-ioc';
import AppState from '../app/state/AppState';

/**
 * Idea: remove abstract and method handleSpecificIntent, override handle in subclasses and call super.handle() at the beginning.
 * Idea: add methods addDirective(), addSpeech(), addError(), use simple classes as parameters, e.g. AssigneeSpeech extends Speech
 */
export abstract class AbstractIntentHandler {

    @Inject
    protected appState: AppState;

    protected speech: Speech;
    protected session: alexa.session;

    protected outputDirectives: any[] = [];

    constructor() {
        this.resetSpeech();
        this.resetDirectives();
    }

    public async handle(request: alexa.request, response: alexa.response): Promise<alexa.response> {
        this.resetSpeech();
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

}
