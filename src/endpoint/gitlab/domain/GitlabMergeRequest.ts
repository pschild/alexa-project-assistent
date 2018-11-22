import { GitlabUser } from './GitlabUser';
import { Type } from 'class-transformer';
import { MergeRequestState, MergeStatus } from './GitlabEnums';

export class GitlabMergeRequest {
    id: number;
    title: string;
    description: string;
    state: MergeRequestState;

    @Type(() => Date)
    // tslint:disable-next-line:variable-name
    created_at: Date;

    @Type(() => Date)
    // tslint:disable-next-line:variable-name
    updated_at: Date;

    // tslint:disable-next-line:variable-name
    merge_status: MergeStatus;

    @Type(() => GitlabUser)
    author: GitlabUser;

    @Type(() => GitlabUser)
    assignee: GitlabUser;
}
