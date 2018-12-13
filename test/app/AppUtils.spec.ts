import * as alexa from 'alexa-app';
import { hasDisplaySupport, isStopIntent, isSessionEndedRequest, containsDialogDirective, excludeDisplayDirectives, excludeGameEngineDirectives } from '../../src/app/appUtils';

// tslint:disable-next-line:no-var-requires
const mockRequestWithDisplaySupport = require('@mockData/alexa/requestWithDisplaySupport.json');
// tslint:disable-next-line:no-var-requires
const mockRequestWithoutDisplaySupport = require('@mockData/alexa/requestWithoutDisplaySupport.json');
// tslint:disable-next-line:no-var-requires
const mockRequestWithSessionEndedRequest = require('@mockData/alexa/requestWithSessionEndedRequest.json');
// tslint:disable-next-line:no-var-requires
const mockRequestWithStopIntent = require('@mockData/alexa/requestWithStopIntent.json');
// tslint:disable-next-line:no-var-requires
const mockResponseWithDialogConfirmSlotDirective = require('@mockData/alexa/responseWithDialogConfirmSlotDirective.json');
// tslint:disable-next-line:no-var-requires
const mockResponseWithDialogDelegateDirective = require('@mockData/alexa/responseWithDialogDelegateDirective.json');
// tslint:disable-next-line:no-var-requires
const mockResponseWithDialogElicitSlotDirective = require('@mockData/alexa/responseWithDialogElicitSlotDirective.json');
// tslint:disable-next-line:no-var-requires
const mockResponseWithDisplayDirective = require('@mockData/alexa/responseWithDisplayDirective.json');
// tslint:disable-next-line:no-var-requires
const mockResponseWithAplDocumentDirective = require('@mockData/alexa/responseWithAplDocumentDirective.json');
// tslint:disable-next-line:no-var-requires
const mockResponseWithGameEngineDirective = require('@mockData/alexa/responseWithGameEngineDirective.json');

describe('AppUtils', () => {

    it('can detect display support', () => {
        expect(hasDisplaySupport(new alexa.request(mockRequestWithDisplaySupport))).toBe(true);
        expect(hasDisplaySupport(new alexa.request(mockRequestWithoutDisplaySupport))).toBe(false);
    });

    it('can detect stop intents', () => {
        expect(isStopIntent(new alexa.request(mockRequestWithStopIntent))).toBe(true);
    });

    it('can detect session end requests', () => {
        expect(isSessionEndedRequest(new alexa.request(mockRequestWithSessionEndedRequest))).toBe(true);
    });

    it('can detect dialog directives', () => {
        expect(containsDialogDirective(mockResponseWithDialogConfirmSlotDirective)).toBe(true);
        expect(containsDialogDirective(mockResponseWithDialogDelegateDirective)).toBe(true);
        expect(containsDialogDirective(mockResponseWithDialogElicitSlotDirective)).toBe(true);
    });

    it('can filter display directives', () => {
        const responseObj = mockResponseWithDisplayDirective.response.response;
        expect(responseObj.directives.length).toBe(1);
        expect(responseObj.directives[0].type).toBe('Display.RenderTemplate');

        responseObj.directives = excludeDisplayDirectives(mockResponseWithDisplayDirective);

        expect(responseObj.directives.length).toBe(0);
    });

    it('can filter display APL directives', () => {
        const responseObj = mockResponseWithAplDocumentDirective.response.response;
        expect(responseObj.directives.length).toBe(1);
        expect(responseObj.directives[0].type).toBe('Alexa.Presentation.APL.RenderDocument');

        responseObj.directives = excludeDisplayDirectives(mockResponseWithAplDocumentDirective);

        expect(responseObj.directives.length).toBe(0);
    });

    it('can filter game engine directives', () => {
        const responseObj = mockResponseWithGameEngineDirective.response.response;
        expect(responseObj.directives.length).toBe(1);
        expect(responseObj.directives[0].type).toBe('GameEngine.StartInputHandler');

        responseObj.directives = excludeGameEngineDirectives(mockResponseWithGameEngineDirective);

        expect(responseObj.directives.length).toBe(0);
    });
});
