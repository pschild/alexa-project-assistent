export enum UserState {
    ACTIVE = 'active',
    BLOCKED = 'blocked'
}

export enum MergeRequestScope {
    ALL = 'all',
    CREATED_BY_ME = 'created_by_me',
    ASSIGNED_TO_ME = 'assigned_to_me'
}

export enum MergeRequestState {
    OPENED = 'opened',
    CLOSED = 'closed',
    LOCKED = 'locked',
    MERGED = 'merged'
}

export enum MergeStatus {
    CAN_BE_MERGED = 'can_be_merged',
    CANNOT_BE_MERGED = 'cannot_be_merged',
    UNCHECKED = 'unchecked'
}

export enum PipelineState {
    SUCCESS = 'success',
    FAILED = 'failed',
    SKIPPED = 'skipped'
}
