export enum IssueType {
    BUG = 'Bug',
    TASK = 'Aufgabe',
    SUBTASK = 'Unteraufgabe',
    STORY = 'Story',
    EPIC = 'Epic',
    IMPROVEMENT = 'Verbesserung'
}

export enum IssueStatus {
    OPEN = 'Offen',
    NEW = 'Neu',
    CLOSED = 'Geschlossen',
    DONE = 'Erledigt',
    IN_PROGRESS = 'In Arbeit',
    FINISHED = 'Fertig',
    REOPENED = 'Erneut geöffnet'
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
