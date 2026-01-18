import express from 'express';
import cors from 'cors';
import { prisma } from '../lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// GET /api/articles - Get all articles with optional filters
app.get('/api/articles', async (req, res) => {
    try {
        const { topic, startDate, endDate, limit = '50' } = req.query;

        const where: any = {};

        // Filter by topic
        if (topic) {
            where.topic = {
                contains: topic as string,
                mode: 'insensitive'
            };
        }

        // Filter by date range
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate as string);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate as string);
            }
        }

        const articles = await prisma.article.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string),
        });

        res.json({
            success: true,
            count: articles.length,
            data: articles,
        });
    } catch (error: any) {
        console.error('Error fetching articles:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch articles',
            message: error.message,
        });
    }
});

// GET /api/articles/by-topic/:topic - Get articles by specific topic
app.get('/api/articles/by-topic/:topic', async (req, res) => {
    try {
        const { topic } = req.params;
        const { limit = '50' } = req.query;

        const articles = await prisma.article.findMany({
            where: {
                topic: {
                    contains: topic,
                    mode: 'insensitive'
                }
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string),
        });

        res.json({
            success: true,
            topic,
            count: articles.length,
            data: articles,
        });
    } catch (error: any) {
        console.error('Error fetching articles by topic:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch articles',
            message: error.message,
        });
    }
});

// GET /api/articles/by-date - Get articles by date range
app.get('/api/articles/by-date', async (req, res) => {
    try {
        const { startDate, endDate, limit = '50' } = req.query;

        if (!startDate && !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Please provide at least startDate or endDate',
            });
        }

        const where: any = {
            createdAt: {}
        };

        if (startDate) {
            where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
            where.createdAt.lte = new Date(endDate as string);
        }

        const articles = await prisma.article.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string),
        });

        res.json({
            success: true,
            dateRange: { startDate, endDate },
            count: articles.length,
            data: articles,
        });
    } catch (error: any) {
        console.error('Error fetching articles by date:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch articles',
            message: error.message,
        });
    }
});

// GET /api/topics - Get all unique topics
app.get('/api/topics', async (req, res) => {
    try {
        const articles = await prisma.article.findMany({
            select: { topic: true },
            distinct: ['topic'],
        });

        const topics = articles.map((a: { topic: string }) => a.topic);

        res.json({
            success: true,
            count: topics.length,
            data: topics,
        });
    } catch (error: any) {
        console.error('Error fetching topics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch topics',
            message: error.message,
        });
    }
});

// GET /api/stats - Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const totalArticles = await prisma.article.count();

        const articlesByTopic = await prisma.article.groupBy({
            by: ['topic'],
            _count: true,
        });

        res.json({
            success: true,
            data: {
                totalArticles,
                articlesByTopic: articlesByTopic.map((item: { topic: string; _count: number }) => ({
                    topic: item.topic,
                    count: item._count,
                })),
            },
        });
    } catch (error: any) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics',
            message: error.message,
        });
    }
});

// POST /api/scrape-and-summarize - Scrape articles from specific websites/interests and summarize
app.post('/api/scrape-and-summarize', async (req, res) => {
    try {
        const { interests, websites } = req.body;

        if (!interests || !Array.isArray(interests) || interests.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'interests array is required'
            });
        }

        if (!websites || !Array.isArray(websites) || websites.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'websites array is required'
            });
        }

        console.log(`Starting scrape pipeline for interests: ${interests.join(', ')} on domains: ${websites.join(', ')}`);

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const results = [];
        const maxArticles = 4;
        let articlesProcessed = 0;

        // Import fetcher functions
        const { fetchArticles, fetchDetailedContent, callSummarizationAPI } = await import('./fetcher.js');

        for (const interest of interests) {
            if (articlesProcessed >= maxArticles) break;

            for (const website of websites) {
                if (articlesProcessed >= maxArticles) break;

                try {
                    console.log(`\n=== Phase 1: Scraping ${website} for interest: ${interest} ===`);

                    // Phase 1: Fetch article links from specific website
                    const articles = await fetchArticles(interest, website, websites);

                    if (articles.length === 0) {
                        console.log(`No articles found for ${interest} on ${website}`);
                        continue;
                    }

                    console.log(`Found ${articles.length} articles, now fetching full content...`);

                    // Process up to 4 articles total
                    for (const article of articles) {
                        if (articlesProcessed >= maxArticles) break;

                        try {
                            // Check if already summarized
                            const existingSummary = await prisma.summarizedArticle.findUnique({
                                where: { url: article.url }
                            });

                            if (existingSummary) {
                                console.log(`Already summarized: ${article.title}`);
                                continue;
                            }

                            // Phase 2: Fetch detailed content from the article URL
                            console.log(`\n=== Phase 2: Fetching detailed content for: ${article.title} ===`);
                            const detailedContent = await fetchDetailedContent(article.url);

                            if (!detailedContent) {
                                console.warn(`Could not fetch detailed content for ${article.url}`);
                                continue;
                            }

                            // Prepare full article with detailed content
                            const fullArticle = {
                                title: article.title,
                                url: article.url,
                                content: detailedContent.text,
                                source: article.source || website,
                                topic: interest,
                                category: website
                            };

                            // Phase 3: Summarize
                            console.log(`\n=== Phase 3: Summarizing: ${article.title} ===`);
                            const summary = await callSummarizationAPI(fullArticle);

                            if (summary) {
                                // Save to SummarizedArticle
                                const summarizedArticle = await prisma.summarizedArticle.create({
                                    data: {
                                        title: article.title,
                                        summary: summary,
                                        url: article.url,
                                        source: article.source || website,
                                        content: detailedContent.text,
                                        topic: interest,
                                        timestamp: new Date()
                                    }
                                });

                                results.push(summarizedArticle);
                                articlesProcessed++;
                                console.log(`✓ Saved summary for: ${article.title}`);
                            } else {
                                console.warn(`Failed to get summary for: ${article.title}`);
                            }

                            await delay(1500); // Rate limiting
                        } catch (e) {
                            console.error(`Failed to process article ${article.url}:`, e);
                        }
                    }

                    await delay(1000);
                } catch (e) {
                    console.error(`Error scraping ${website} for ${interest}:`, e);
                }
            }
        }

        res.json({
            success: true,
            message: `Processed ${articlesProcessed} articles`,
            articlesCount: results.length,
            articles: results
        });
    } catch (error: any) {
        console.error('Error in scrape-and-summarize:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to scrape and summarize',
            message: error.message,
        });
    }
});

// GET /api/feed - Get all summarized articles for the feed
app.get('/api/feed', async (req, res) => {
    try {
        const articles = await prisma.summarizedArticle.findMany({
            orderBy: {
                timestamp: 'desc'
            }
        });

        res.json({
            success: true,
            articles,
            count: articles.length
        });
    } catch (error: any) {
        console.error('Error fetching feed articles:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch feed articles',
            message: error.message,
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📊 Available endpoints:`);
    console.log(`   GET /api/articles - Get all articles (supports ?topic=, ?startDate=, ?endDate=, ?limit=)`);
    console.log(`   GET /api/articles/by-topic/:topic - Get articles by topic`);
    console.log(`   GET /api/articles/by-date - Get articles by date range`);
    console.log(`   GET /api/topics - Get all unique topics`);
    console.log(`   GET /api/stats - Get statistics`);
    console.log(`   GET /api/feed - Get all summarized articles for feed`);
    console.log(`   POST /api/scrape-and-summarize - Scrape specific websites/interests and summarize (body: {interests: [], websites: []})`);
    console.log(`   GET /health - Health check`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
