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
    content?: string;
    source?: string;
    publishedDate?: string;
}

export interface FullArticleContent {
    title: string;
    url: string;
    content: string;
    source: string;
    topic: string;
    category: string;
}

interface SummarizeResponse {
    success: boolean;
    summary?: {
        id?: string;
        title: string;
        summary: string;
        source?: string;
        url?: string;
        timestamp: string;
    };
    error?: string;
}

/**
 * Clean and validate text content
 */
function cleanText(text: string | undefined, maxLength: number = 500): string {
    if (!text) { return ''; }

    // Remove excessive whitespace and newlines
    let cleaned = text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .trim();

    // Truncate if too long
    if (cleaned.length > maxLength) {
        cleaned = cleaned.substring(0, maxLength) + '...';
    }

    return cleaned;
}

/**
 * Call the game API to summarize an article
 */
async function callSummarizationAPI(article: FullArticleContent): Promise<string | null> {
    const gameApiUrl = process.env.GAME_API_URL || 'http://localhost:5173';

    try {
        const response = await fetch(`${gameApiUrl}/api/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                article: {
                    title: article.title,
                    content: article.content,
                    url: article.url,
                    source: article.source
                }
            })
        });

        if (!response.ok) {
            console.error(`Summarization API returned status ${response.status}`);
            return null;
        }

        const data: SummarizeResponse = await response.json();

        if (data.success && data.summary) {
            return data.summary.summary;
        }

        console.error('Summarization API error:', data.error);
        return null;
    } catch (error: any) {
        console.error('Failed to call summarization API:', error.message);
        return null;
    }
}

/**
 * Fetch detailed content for a specific URL using Exa's getContents
 */
export async function fetchDetailedContent(url: string): Promise<{ title: string; text: string } | null> {
    try {
        const result = await exa.getContents([url], {
            text: { maxCharacters: 5000, includeHtmlTags: false }
        });

        if (result.results && result.results.length > 0) {
            const content = result.results[0];
            return {
                title: content.title || cleanText(content.text, 200),
                text: content.text || ''
            };
        }
    } catch (error: any) {
        console.error(`Failed to fetch detailed content for ${url}:`, error.message);
    }

    return null;
}

export async function fetchArticles(topic: string, category: string, domains?: string[]): Promise<SerpResult[]> {
    console.log(`Fetching ${category} for topic: ${topic}${domains ? ` from domains: ${domains.join(', ')}` : ''}`);

    try {
        // Initial search
        const searchResult = await exa.searchAndContents(
            `new niche prominent interesting ${topic} ${category} analysis`,
            {
                type: "neural",
                useAutoprompt: true,
                numResults: 10,
                text: true,
                livecrawl: "always",
                ...(domains && domains.length > 0 && { domain: domains })  // Add domain filter if provided
            }
        );

        if (!searchResult.results || searchResult.results.length === 0) {
            console.log(`No results found for ${topic} in ${category}`);
            return [];
        }

        console.log(`Found ${searchResult.results.length} initial results for ${topic} (${category})`);
        console.log(`Fetching detailed content for each URL...`);

        const enrichedResults: SerpResult[] = [];

        // Fetch detailed content for each URL
        for (const item of searchResult.results) {
            try {
                // Get detailed content
                const detailedContent = await fetchDetailedContent(item.url);

                if (detailedContent) {
                    enrichedResults.push({
                        title: detailedContent.title || cleanText(item.text, 200) || 'Untitled',
                        url: item.url,
                        description: detailedContent.text || cleanText(item.text, 500) || '',
                        content: detailedContent.text,
                        source: new URL(item.url).hostname,
                        publishedDate: item.publishedDate
                    });
                } else {
                    // Fallback to original data if detailed fetch fails
                    enrichedResults.push({
                        title: cleanText(item.text, 200) || 'Untitled',
                        url: item.url,
                        description: cleanText(item.text, 500) || '',
                        content: item.text || '',
                        source: new URL(item.url).hostname,
                        publishedDate: item.publishedDate
                    });
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error: any) {
                console.error(`Error processing ${item.url}:`, error.message);
            }
        }

        console.log(`Successfully enriched ${enrichedResults.length} results for ${topic} (${category})`);
        return enrichedResults;

    } catch (error: any) {
        console.error(`Error fetching articles for topic ${topic} (${category}):`, error.message);
        return [];
    }
}

/**
 * Fetch articles with full content for summarization
 */
export async function fetchArticlesWithContent(topic: string, category: string): Promise<FullArticleContent[]> {
    console.log(`Fetching ${category} with full content for topic: ${topic}`);

    try {
        // Initial search
        const searchResult = await exa.searchAndContents(
            `${topic} ${category}`,
            {
                type: "neural",
                useAutoprompt: true,
                numResults: 10,
                text: { maxCharacters: 5000, includeHtmlTags: false },
                livecrawl: "always"
            }
        );

        if (!searchResult.results || searchResult.results.length === 0) {
            console.log(`No results found for ${topic} in ${category}`);
            return [];
        }

        console.log(`Found ${searchResult.results.length} results with content for ${topic} (${category})`);

        const articlesWithContent: FullArticleContent[] = [];

        for (const item of searchResult.results) {
            try {
                if (item.text && item.text.length > 100) {
                    articlesWithContent.push({
                        title: item.title || cleanText(item.text, 200) || 'Untitled',
                        url: item.url,
                        content: item.text,
                        source: new URL(item.url).hostname,
                        topic: topic,
                        category: category
                    });
                }
            } catch (error: any) {
                console.error(`Error processing ${item.url}:`, error.message);
            }
        }

        console.log(`Successfully retrieved ${articlesWithContent.length} articles with content`);
        return articlesWithContent;

    } catch (error: any) {
        console.error(`Error fetching articles with content for ${topic} (${category}):`, error.message);
        return [];
    }
}

// Export for use in index.ts
export { callSummarizationAPI };

