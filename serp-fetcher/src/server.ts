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
    console.log(`   GET /health - Health check`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
