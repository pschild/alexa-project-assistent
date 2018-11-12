import { Type } from 'class-transformer';
import { JenkinsBuild } from './JenkinsBuild';
import { JenkinsHealthReport } from './JenkinsHealthReport';

// TODO: move to separate file
// see https://github.com/jenkinsci/jenkins/blob/22aa2e6e766074d11249893e3f35e0b99e20d3d0/core/src/main/java/hudson/model/BallColor.java
export enum Color {
    ABORTED = 'aborted'
}

export class JenkinsProject {
    displayName: string;
    buildable: boolean;
    color: Color;
    inQueue: boolean;

    @Type(() => JenkinsBuild)
    builds: JenkinsBuild[];

    @Type(() => JenkinsHealthReport)
    healthReport: JenkinsHealthReport[];

    @Type(() => JenkinsBuild)
    lastBuild: JenkinsBuild;

    @Type(() => JenkinsBuild)
    lastCompletedBuild: JenkinsBuild;

    @Type(() => JenkinsBuild)
    lastFailedBuild: JenkinsBuild;

    @Type(() => JenkinsBuild)
    lastStableBuild: JenkinsBuild;

    @Type(() => JenkinsBuild)
    lastSuccessfulBuild: JenkinsBuild;

    @Type(() => JenkinsBuild)
    lastUnstableBuild: JenkinsBuild;

    @Type(() => JenkinsBuild)
    lastUnsuccessfulBuild: JenkinsBuild;
}
