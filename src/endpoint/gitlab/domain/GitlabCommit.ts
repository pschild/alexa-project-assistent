import { Type } from 'class-transformer';

export class GitlabCommit {
    id: number;
    title: string;
    message: string;

    @Type(() => Date)
    // tslint:disable-next-line:variable-name
    created_at: Date;

    // tslint:disable-next-line:variable-name
    author_name: string;

    // tslint:disable-next-line:variable-name
    committer_name: string;
}
