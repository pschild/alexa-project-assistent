import { Expose } from 'class-transformer';
import { UserState } from './GitlabEnums';

export class GitlabUser {
    id: number;
    name: string;
    username: string;
    state: UserState;

    @Expose({ name: 'avatarUrl' })
    // tslint:disable-next-line:variable-name
    avatar_url: string;
}
