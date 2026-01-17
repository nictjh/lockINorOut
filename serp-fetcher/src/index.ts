import { PrismaClient } from '@prisma/client';
import { fetchArticles } from './fetcher.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TOPICS = ['cybersecurity', 'artificial intelligence'];

async function main() {
    console.log('Starting SERP article fetcher...');

    for (const topic of TOPICS) {
        const articles = await fetchArticles(topic);
        console.log(`Found ${articles.length} articles for ${topic}`);

        for (const article of articles) {
            try {
                await prisma.article.upsert({
                    where: { url: article.url },
                    update: {}, // Don't update if exists, just ignore
                    create: {
                        title: article.title,
                        url: article.url,
                        snippet: article.description,
                        topic: topic,
                        source: article.source,
                    },
                });
            } catch (e) {
                console.error(`Failed to save article ${article.url}:`, e);
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
