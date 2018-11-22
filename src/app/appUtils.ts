// tslint:disable-next-line:no-string-literal
export const hasDisplaySupport = (request) => request.data.context.System.device['supportedInterfaces'].hasOwnProperty('Display');
