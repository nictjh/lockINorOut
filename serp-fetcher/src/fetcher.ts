import { search, SafeSearchType } from 'duck-duck-scrape';

export interface SerpResult {
    title: string;
    url: string;
    description: string;
    source?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchArticles(topic: string, retries = 3): Promise<SerpResult[]> {
    console.log(`Fetching articles for topic: ${topic}`);

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Add delay before request to avoid rate limiting
            if (attempt > 1) {
                const waitTime = attempt * 2000; // Exponential backoff
                console.log(`Retrying in ${waitTime}ms... (attempt ${attempt}/${retries})`);
                await delay(waitTime);
            }

            const searchResults = await search(topic, {
                safeSearch: SafeSearchType.STRICT,
                time: 'w', // Articles from the past week
            });

            if (searchResults.noResults) {
                console.log(`No results found for topic: ${topic}`);
                return [];
            }

            console.log(`Successfully fetched ${searchResults.results.length} results for ${topic}`);
            return searchResults.results.map((result: any) => ({
                title: result.title,
                url: result.url,
                description: result.description,
                source: result.hostname,
            }));
        } catch (error: any) {
            console.error(`Error fetching articles for topic ${topic} (attempt ${attempt}/${retries}):`, error.message);

            if (attempt === retries) {
                console.error(`Failed after ${retries} attempts`);
                return [];
            }
        }
    }

    return [];
}
