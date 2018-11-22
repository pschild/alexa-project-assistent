import { Type } from 'class-transformer';
import { GitlabCommit } from './GitlabCommit';

export class GitlabBranch {
    name: string;
    merged: boolean;
    protected: boolean;

    @Type(() => GitlabCommit)
    commit: GitlabCommit;

    // tslint:disable-next-line:variable-name
    developers_can_push: boolean;

    // tslint:disable-next-line:variable-name
    developers_can_merge: boolean;
}
