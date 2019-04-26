export enum IssueType {
    BUG = 'Bug',
    TASK = 'Aufgabe',
    SUBTASK = 'Unteraufgabe',
    STORY = 'Story',
    EPIC = 'Epic',
    IMPROVEMENT = 'Verbesserung'
}

export enum IssuePriority {
    HIGHEST = 'Highest',
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
    LOWEST = 'Lowest'
}

export enum IssueTransitionStatus {
    TODO = 11,
    IN_PROGRESS = 21,
    DONE = 31
}

export enum IssueStatus {
    OPEN = 'Offen',
    NEW = 'Neu',
    CLOSED = 'Closed',
    DONE = 'Erledigt',
    IN_PROGRESS = 'In Progress',
    FINISHED = 'Fertig',
    RESOLVED = 'Resolved',
    REOPENED = 'Reopened'
}

export enum SprintStatus {
    ACTIVE = 'active',
    CLOSED = 'closed',
    FUTURE = 'future'
}

export enum TestCoverageStatus {
    FAILED = 'NOK',
    SUCCESSFUL = 'OK',
    NOT_RUN = 'NOTRUN',
    UNCOVERED = 'UNCOVERED'
}

export enum TestRunStatus {
    PASS = 'PASS',
    TODO = 'TODO',
    EXECUTING = 'EXECUTING',
    FAIL = 'FAIL',
    ABORTED = 'ABORTED'
}

export enum SwimlaneStatus {
    TODO = 'To Do',
    IN_PROGRESS = 'In Progress',
    DONE = 'Done'
}
