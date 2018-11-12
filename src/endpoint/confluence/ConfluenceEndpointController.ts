import { EndpointController } from '../EndpointController';
import { plainToClass } from 'class-transformer';
import { AutoWired, Singleton } from 'typescript-ioc';
import { ConfluenceContent } from './domain/ConfluenceContent';

@AutoWired
@Singleton
export class ConfluenceEndpointController extends EndpointController {

    public config(baseUrl?: string, username?: string, password?: string) {
        return super.config(
            baseUrl || process.env.CONFLUENCE_BASE_URL,
            username || process.env.CONFLUENCE_USERNAME,
            password || process.env.CONFLUENCE_PASSWORD
        );
    }

    public async getContent(title: string): Promise<ConfluenceContent> {
        const result = await this.get({
            uri: `${this.baseUrl}/rest/api/content?title=${encodeURIComponent(title)}&expand=body.view`
        });
        return plainToClass(ConfluenceContent, result.results[0] as ConfluenceContent); // TODO: wrap results[0] in entity?
    }
}
