import { sayInEnglish, sayAsDecimal, sayAsDuration, pause, sayJiraTicket, spell } from '../../src/app/speechUtils';

describe('SpeechUtils', () => {

    it('can say text in englisch', () => {
        expect(sayInEnglish('jira')).toBe('<lang xml:lang="en-US">jira</lang>');
    });

    it('can say number in decimal', () => {
        expect(sayAsDecimal(12)).toBe('12');
        expect(sayAsDecimal(12.3)).toBe('12,3');
        expect(sayAsDecimal(12.34)).toBe('12,34');
    });

    it('can say number in decimal', () => {
        expect(sayAsDuration(12)).toBe('12 Sekunden');
        expect(sayAsDuration(29000)).toEqual('8 Stunden, 3 Minuten und 20 Sekunden');
        expect(sayAsDuration(14400)).toEqual('4 Stunden');
        expect(sayAsDuration(1234567)).toEqual('2 Wochen, 6 Stunden, 56 Minuten und 7 Sekunden');
    });

    it('can add a pause', () => {
        expect(pause(12)).toBe('<break time=\'12ms\'/>');
    });

    it('can say the jira ticket key', () => {
        expect(sayJiraTicket('FOO', '42')).toBe(
            '<say-as interpret-as=\'characters\'>FOO</say-as> <break time=\'20ms\'/> <say-as interpret-as=\'digits\'>42</say-as>'
        );
    });

    it('can spell a word', () => {
        expect(spell('Hello')).toBe('<say-as interpret-as=\'characters\'>Hello</say-as>');
    });
});
