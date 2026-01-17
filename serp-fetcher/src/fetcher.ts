import { search, SafeSearchType } from 'duck-duck-scrape';

export interface SerpResult {
    title: string;
    url: string;
    description: string;
    source?: string;
}

export async function fetchArticles(topic: string): Promise<SerpResult[]> {
    console.log(`Fetching articles for topic: ${topic}`);
    try {
        const searchResults = await search(topic, {
            safeSearch: SafeSearchType.STRICT,
            time: 'w', // Articles from the past week (optional, adjust as needed)
        });

        if (searchResults.noResults) {
            console.log(`No results found for topic: ${topic}`);
            return [];
        }

        return searchResults.results.map((result: any) => ({
            title: result.title,
            url: result.url,
            description: result.description,
            source: result.hostname,
        }));
    } catch (error) {
        console.error(`Error fetching articles for topic ${topic}:`, error);
        return [];
    }
}
