import { Type } from 'class-transformer';
import { SonarQubeProject } from './SonarQubeProject';

export class SonarQubeProjectsResult {
    paging: {total: number};

    @Type(() => SonarQubeProject)
    components: SonarQubeProject[];
}
