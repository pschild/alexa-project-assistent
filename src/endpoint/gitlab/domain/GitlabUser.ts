import { UserState } from './enum';

export class GitlabUser {
    id: number;
    name: string;
    username: string;
    state: UserState;

    // tslint:disable-next-line:variable-name
    avatar_url: string;
}
