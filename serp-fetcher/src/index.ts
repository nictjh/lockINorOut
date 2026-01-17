import { prisma } from '../lib/prisma.js';
import { fetchArticles } from './fetcher.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOPICS = ['cybersecurity', 'artificial intelligence'];
const CATEGORIES = ['News', 'Industry Developments', 'Blogs'];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log('Starting Exa article fetcher...');

    for (const topic of TOPICS) {
        for (const category of CATEGORIES) {

            // Add slight delay to be nice to API
            await delay(1000);

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
                            // You might want to map publishedDate to createdAt or a new field if available
                        },
                    });
                } catch (e) {
                    console.error(`Failed to save article ${article.url}:`, e);
                }
            }
        }
    }

    console.log('Finished fetching and saving articles.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
