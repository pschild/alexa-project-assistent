import { Type } from 'class-transformer';
import { PipelineState } from './enum';
import { GitlabUser } from './GitlabUser';

export class GitlabPipeline {
    id: number;
    ref: string;
    status: PipelineState;

    @Type(() => GitlabUser)
    user: GitlabUser;

    @Type(() => Date)
    // tslint:disable-next-line:variable-name
    created_at: Date;

    @Type(() => Date)
    // tslint:disable-next-line:variable-name
    started_at: Date;

    @Type(() => Date)
    // tslint:disable-next-line:variable-name
    finished_at: Date;

    duration: number; // seconds
}
