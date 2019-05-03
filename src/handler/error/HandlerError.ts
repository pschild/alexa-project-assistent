import { isArray } from 'util';

export class HandlerError extends Error {

    public directives: any[] = [];

    constructor(message?: string, directives?: any) {
        super(message);

        if (directives) {
            if (!isArray(directives)) {
                directives = [directives];
            }
            this.directives = directives;
        }
    }
}
