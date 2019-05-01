export enum NotificationType {
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error'
}

export interface IHomeDocumentPayload {
    backgroundImageUrl?: string;
    logoUrl: string;
    randomCommand: string;
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

export interface IMergeRequestsDocumentPayload {
    backgroundImageUrl?: string;
    projects: IProjectPayload[];
}

export interface IProjectPayload {
    projectName: string;
    mrCount: number;
    mergeRequests?: IMergeRequestPayload[];
}

export interface IMergeRequestPayload {
    age: string;
    assigneeName?: string;
}

export interface IBuildStatusDocumentPayload {
    backgroundImageUrl?: string;
    projectName?: string;
    pipelines: IPipelinePayload[];
}

export interface IPipelinePayload {
    finishedAt: string;
    branchOrProject?: string;
    statusImageUrl: string;
    stages: IStagePayload[];
}

export interface IStagePayload {
    name: string;
    statusImageUrl: string;
}

export interface IEffortForReleaseDocumentPayload {
    backgroundImageUrl?: string;
    releaseName: string;
    releaseDate: string;
    epicCount: number;
    doneEpicCount: number;
    originalSeconds: number;
    remainingSeconds: number;
    remainingWorkLabel: string;
    taskProgressImageUrl: string;
}

export interface INotificationDocumentPayload {
    backgroundImageUrl?: string;
    type: NotificationType;
    iconUrl: string;
    text: string;
}

export interface IHelpDocumentPayload {
    backgroundImageUrl?: string;
    items: IHelpItem[];
}

export interface IHelpDetailDocumentPayload {
    backgroundImageUrl?: string;
    imageUrl: string;
    hints: string[];
}

export interface IHelpItem {
    identifier: string;
    title: string;
    hints: string[];
    imageUrl: string;
}

export const buildHomeScreenDirective = (data: IHomeDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'homeDocument',
        document: require(`@apl/homeDocument.json`),
        datasources: { data }
    };
};

export const buildHelpDirective = (data: IHelpDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'helpDocument',
        document: require(`@apl/helpDocument.json`),
        datasources: { data }
    };
};

export const buildHelpDetailDirective = (data: IHelpDetailDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'helpDetailDocument',
        document: require(`@apl/helpDetailDocument.json`),
        datasources: { data }
    };
};

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

export const buildBuildStatusDirective = (data: IBuildStatusDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'buildStatusProgressDocument',
        document: require(`@apl/buildStatusDocument.json`),
        datasources: { data }
    };
};

export const buildMergeRequestsDirective = (data: IMergeRequestsDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'mergeRequestsDocument',
        document: require(`@apl/mergeRequestsDocument.json`),
        datasources: { data }
    };
};

export const buildEffortForReleaseDirective = (data: IEffortForReleaseDocumentPayload) => {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'effortForReleaseDocument',
        document: require(`@apl/effortForReleaseDocument.json`),
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
