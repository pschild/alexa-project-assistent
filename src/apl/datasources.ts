export interface IImageDocumentPayload {
    title: string;
    subtitle?: string;
    backgroundImageUrl?: string;
    imageUrl: string;
    logoUrl: string;
}

export interface ITouchableTextDocumentPayload {
    text: string;
}

export const buildImageDirective = (data: IImageDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'imageDocument',
        document: require(`@apl/imageDocument.json`),
        datasources: { data }
    };
};

export const buildTouchableTextDirective = (data: ITouchableTextDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'touchableTextDocument',
        document: require(`@apl/touchableTextDocument.json`),
        datasources: { data }
    };
};
