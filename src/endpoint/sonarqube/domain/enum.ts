export enum MetricType {
    INT = 'INT',
    FLOAT = 'FLOAT',
    MILLISEC = 'MILLISEC',
    DATA = 'DATA',
    PERCENT = 'PERCENT',
    RATING = 'RATING',
    DISTRIB = 'DISTRIB',
    WORK_DUR = 'WORK_DUR'
}

export enum IssueSeverity {
    INFO = 'INFO',
    MINOR = 'MINOR',
    MAJOR = 'MAJOR',
    CRITICAL = 'CRITICAL',
    BLOCKER = 'BLOCKER'
}

export enum IssueRuleType {
    CODE_SMELL = 'CODE_SMELL',
    BUG = 'BUG',
    VULNERABILITY = 'VULNERABILITY',
    SECURITY_HOTSPOT = 'SECURITY_HOTSPOT'
}

export enum QualityGateStatus {
    OK = 'OK',
    ERROR = 'ERROR'
}
