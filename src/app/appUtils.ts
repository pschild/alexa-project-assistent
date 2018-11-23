export const hasDisplaySupport = (request) => {
    return request
        && request.data
        && request.data.context
        && request.data.context.System
        && request.data.context.System.device['supportedInterfaces']
        && request.data.context.System.device['supportedInterfaces'].hasOwnProperty('Display');
};
