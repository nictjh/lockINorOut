import { Exa } from 'exa-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const exa = new Exa(process.env.EXA_API_KEY);

export interface SerpResult {
    title: string;
    url: string;
    description: string;
    source?: string;
    publishedDate?: string;
}

export async function fetchArticles(topic: string, category: string): Promise<SerpResult[]> {
    console.log(`Fetching ${category} for topic: ${topic}`);

    try {
        const result = await exa.searchAndContents(
            `${topic} ${category}`,
            {
                type: "neural",
                useAutoprompt: true,
                numResults: 10,
                text: true,
                livecrawl: "always"
            }
        );

        if (!result.results || result.results.length === 0) {
            console.log(`No results found for ${topic} in ${category}`);
            return [];
        }

        console.log(`Successfully fetched ${result.results.length} results for ${topic} (${category})`);

        return result.results.map((item: any) => ({
            title: item.title || 'Untitled',
            url: item.url,
            description: item.text ? item.text.substring(0, 300) + '...' : '',
            source: new URL(item.url).hostname,
            publishedDate: item.publishedDate
        }));

    } catch (error: any) {
        console.error(`Error fetching articles for topic ${topic} (${category}):`, error.message);
        return [];
    }
}
