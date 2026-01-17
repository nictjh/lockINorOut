import { prisma } from '../lib/prisma.js';
import { fetchArticles, fetchArticlesWithContent, callSummarizationAPI } from './fetcher.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOPICS = ['cybersecurity', 'artificial intelligence'];
const CATEGORIES = ['News', 'Industry Developments', 'Blogs'];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log('Starting Exa article fetcher with summarization...');

    for (const topic of TOPICS) {
        for (const category of CATEGORIES) {

            // Add slight delay to be nice to API
            await delay(1000);

            // Fetch articles with basic metadata (for the Article table)
            const articles = await fetchArticles(topic, category);
            console.log(`Found ${articles.length} articles for ${topic} - ${category}`);

            for (const article of articles) {
                try {
                    await prisma.article.upsert({
                        where: { url: article.url },
                        update: {
                            category: category // Update category if it exists
                        },
                        create: {
                            title: article.title,
                            url: article.url,
                            snippet: article.description,
                            topic: topic,
                            category: category,
                            source: article.source,
                        },
                    });
                } catch (e) {
                    console.error(`Failed to save article ${article.url}:`, e);
                }
            }

            // Now fetch with full content for summarization
            await delay(2000); // Longer delay before heavy operations

            const articlesWithContent = await fetchArticlesWithContent(topic, category);
            console.log(`Retrieved ${articlesWithContent.length} articles with full content`);

            for (const fullArticle of articlesWithContent) {
                try {
                    // Find the article ID
                    const article = await prisma.article.findUnique({
                        where: { url: fullArticle.url }
                    });

                    if (!article) {
                        console.warn(`Article not found for URL: ${fullArticle.url}`);
                        continue;
                    }

                    // Check if summary already exists
                    const existingSummary = await prisma.summaryArticle.findUnique({
                        where: { articleId: article.id }
                    });

                    if (existingSummary) {
                        console.log(`Summary already exists for: ${fullArticle.title}`);
                        continue;
                    }

                    // Get summary from API
                    console.log(`Summarizing: ${fullArticle.title}`);
                    const summary = await callSummarizationAPI(fullArticle);

                    if (summary) {
                        // Save to database
                        await prisma.summaryArticle.create({
                            data: {
                                articleId: article.id,
                                title: fullArticle.title,
                                summary: summary,
                                content: fullArticle.content,
                                url: fullArticle.url,
                                topic: fullArticle.topic,
                                category: fullArticle.category,
                                source: fullArticle.source
                            }
                        });
                        console.log(`✓ Saved summary for: ${fullArticle.title}`);
                    } else {
                        console.warn(`Failed to get summary for: ${fullArticle.title}`);
                    }

                    // Delay between summarization calls
                    await delay(1500);

                } catch (e) {
                    console.error(`Failed to process article ${fullArticle.url}:`, e);
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
