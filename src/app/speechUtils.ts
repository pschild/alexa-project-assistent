import * as Speech from 'ssml-builder';

export const pronounceEnglish = (text: string): string => {
    return `<lang xml:lang="en-US">${text}</lang>`;
};

export const pause = (ms: number): string => {
    return new Speech().pause(`${ms}ms`).ssml(true);
};

export const jiraTicketSpeech = (ticketIdentifier: string, ticketNumber: string): string => {
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
