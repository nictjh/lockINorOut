import { prisma } from '../lib/prisma.js';
import { fetchArticles, fetchArticlesWithContent, callSummarizationAPI, FullArticleContent } from './fetcher.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOPICS = ['cybersecurity', 'artificial intelligence', 'software engineering', 'quantum computing'];
const CATEGORIES = ['News', 'Industry Developments', 'Blogs', 'Research Summaries', 'Government & Policy'];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log('Starting Exa article fetcher with summarization...');

    for (const topic of TOPICS) {
        for (const category of CATEGORIES) {

            // Add slight delay to be nice to API
            await delay(1000);

            // Phase 1: Fetch and Store in Article (Staging)
            console.log(`Phase 1: Fetching articles for ${topic} - ${category}`);
            const articles = await fetchArticles(topic, category);
            console.log(`Found ${articles.length} articles`);

            for (const article of articles) {
                try {
                    await prisma.article.upsert({
                        where: { url: article.url },
                        update: {
                            category: category,
                            content: article.content // Update content if re-fetching
                        },
                        create: {
                            title: article.title,
                            url: article.url,
                            snippet: article.description,
                            content: article.content, // Store full content
                            topic: topic,
                            category: category,
                            source: article.source,
                        },
                    });
                } catch (e) {
                    console.error(`Failed to save article ${article.url}:`, e);
                }
            }

            // Phase 2: Process from Article -> SummarizedArticle
            console.log(`Phase 2: Processing stored articles for ${topic} - ${category}`);

            // Fetch articles from DB that have content
            const storedArticles = await prisma.article.findMany({
                where: {
                    topic: topic,
                    category: category,
                    content: { not: null } // Only process ones with content
                },
                take: 3 // Limit to 3 articles per topic/category
            });

            console.log(`Found ${storedArticles.length} stored articles to process`);

            // Track processed count
            let processedCount = 0;

            for (const article of storedArticles) {
                if (processedCount >= 3) break; // Hard limit just in case

                try {
                    if (!article.content) continue;

                    // Check if already summarized
                    const existingSummary = await prisma.summarizedArticle.findUnique({
                        where: { url: article.url }
                    });

                    if (existingSummary) {
                        console.log(`Already summarized: ${article.title}`);
                        processedCount++;
                        continue;
                    }

                    // Prepare object for summarizer
                    const fullArticle: FullArticleContent = {
                        title: article.title,
                        url: article.url,
                        content: article.content,
                        source: article.source || '',
                        topic: article.topic,
                        category: article.category || ''
                    };

                    // Get summary from API
                    console.log(`Summarizing: ${article.title}`);
                    const summary = await callSummarizationAPI(fullArticle);

                    if (summary) {
                        // Save to SummarizedArticle
                        await prisma.summarizedArticle.create({
                            data: {
                                title: article.title,
                                summary: summary,
                                content: article.content,
                                url: article.url,
                                topic: article.topic,
                                category: article.category,
                                source: article.source
                            }
                        });
                        console.log(`✓ Saved summary for: ${article.title}`);
                        processedCount++;
                    } else {
                        console.warn(`Failed to get summary for: ${article.title}`);
                    }

                    // Delay between summarization calls
                    await delay(1500);

                } catch (e) {
                    console.error(`Failed to process article ${article.url}:`, e);
                }
            }
        }
    }

    console.log('Finished fetching and saving articles with summaries.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
