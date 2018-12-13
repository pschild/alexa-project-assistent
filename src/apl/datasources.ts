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

export interface IListItem {
    listItemIdentifier: string;
    textContent: {primaryText: any, secondaryText: any};
    imageUrl: string;
    token?: string;
}

export interface IListDocumentPayload {
    title: string;
    logoUrl: string;
    hintText?: string;
    backgroundImageUrl?: string;
    listItems: IListItem[];
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

export const buildListDirective = (data: IListDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'listDocument',
        document: require(`@apl/listDocument.json`),
        datasources: { data }
    };
};

export const buildListItem = (identifier: string, primaryText: string, secondaryText: string, imageUrl: string): IListItem => {
    return {
        listItemIdentifier: identifier,
        textContent: {
            primaryText: {
                type: 'PlainText',
                text: primaryText
            },
            secondaryText: {
                type: 'PlainText',
                text: secondaryText
            }
        },
        imageUrl,
        token: identifier
    };
};
