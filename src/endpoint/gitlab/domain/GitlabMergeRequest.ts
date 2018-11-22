import { GitlabUser } from './GitlabUser';
import { Type, Expose } from 'class-transformer';
import { MergeRequestState, MergeStatus } from './GitlabEnums';

export class GitlabMergeRequest {
    id: number;
    title: string;
    description: string;
    state: MergeRequestState;

    @Type(() => Date)
    @Expose({ name: 'createdAt' })
    // tslint:disable-next-line:variable-name
    created_at: Date;

    @Type(() => Date)
    @Expose({ name: 'updatedAt' })
    // tslint:disable-next-line:variable-name
    updated_at: Date;

    @Expose({ name: 'mergeStatus' })
    // tslint:disable-next-line:variable-name
    merge_status: MergeStatus;

    @Type(() => GitlabUser)
    author: GitlabUser;

    @Type(() => GitlabUser)
    assignee: GitlabUser;
}
