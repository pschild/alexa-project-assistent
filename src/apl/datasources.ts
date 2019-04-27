export enum NotificationType {
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error'
}

export interface IImageDocumentPayload {
    backgroundImageUrl?: string;
    title: string;
    imageUrl: string;
}

export interface IXrayStatusDocumentPayload {
    backgroundImageUrl?: string;
    ticketId: string;
    ticketDescription: string;
    globalStateIconUrl: string;
    imageUrl: string;
    listData: Array<{label: string; iconUrl: string}>;
}

export interface IDashboardDocumentPayload {
    backgroundImageUrl?: string;
    q1: { bugs: number; progress: string; };
    q2: { imageUrl: string; };
    q3: { imageUrl: string; };
    q4: { imageUrl: string; };
}

export interface ISprintProgressDocumentPayload {
    backgroundImageUrl?: string;
    sprintName: string;
    sprintGoal?: string;
    sprintFrom: string;
    sprintTo: string;
    workableIssuesProgressImageUrl: string;
    timeProgressImageUrl: string;
    taskProgressImageUrl: string;
}

export interface ITouchableTextDocumentPayload {
    text: string;
}

export interface ITextSamplesDocumentPayload {
    title: string;
    backgroundImageUrl?: string;
    logoUrl: string;
    textContent: {primaryText: any};
}

export interface INotificationDocumentPayload {
    backgroundImageUrl?: string;
    type: NotificationType;
    iconUrl: string;
    text: string;
}

export interface IListItem {
    listItemIdentifier: string;
    textContent: {primaryText: any, secondaryText: any};
    imageUrl: string;
    token?: string;
}

export interface IListDocumentPayload {
    backgroundImageUrl?: string;
    title: string;
    logoUrl: string;
    hintText?: string;
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

export const buildXrayStatusDirective = (data: IXrayStatusDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'xrayStatusDocument',
        document: require(`@apl/xrayStatusDocument.json`),
        datasources: { data }
    };
};

export const buildDashboardDirective = (data: IDashboardDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'dashboardDocument',
        document: require(`@apl/dashboardDocument.json`),
        datasources: { data }
    };
};

export const buildSprintProgressDirective = (data: ISprintProgressDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'sprintProgressDocument',
        document: require(`@apl/sprintProgressDocument.json`),
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

export const buildTextSamplesDirective = (data: ITextSamplesDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'textSamplesDocument',
        document: require(`@apl/textSamplesDocument.json`),
        datasources: { data }
    };
};

export const buildNotificationDirective = (data: INotificationDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'notificationDocument',
        document: require(`@apl/notificationDocument.json`),
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
