import * as Speech from 'ssml-builder';
import * as humanizeDuration from 'humanize-duration';

export const sayInEnglish = (text: string): string => {
    return `<lang xml:lang="en-US">${text}</lang>`;
};

export const sayAsDecimal = (decNumber: number): string => {
    return decNumber.toString().replace('.', ',');
};

export const sayAsDuration = (seconds: number): string => {
    return humanizeDuration(seconds * 1000, {
        language: 'de',
        conjunction: ' und ',
        serialComma: false
    });
};

export const pause = (ms: number): string => {
    return new Speech().pause(`${ms}ms`).ssml(true);
};

export const sayJiraTicket = (ticketIdentifier: string, ticketNumber?: string): string => {
    if (!ticketNumber) {
        const parts = ticketIdentifier.split('-');
        ticketIdentifier = parts[0];
        ticketNumber = parts[1];
    }
    return new Speech()
        .sayAs({
            interpret: 'characters',
            word: ticketIdentifier
        })
        .pause('20ms')
        .sayAs({
            interpret: 'digits',
            word: ticketNumber
        })
        .ssml(true);
};

export const spell = (word: string): string => {
    return new Speech()
        .sayAs({
            interpret: 'characters',
            word
        })
        .ssml(true);
};
