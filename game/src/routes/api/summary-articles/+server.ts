import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../../../serp-fetcher/generated/prisma/client.js';

// Initialize Prisma client with connection to serp-fetcher database
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/serp-postgres';
const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const GET: RequestHandler = async ({ url }) => {
    try {
        const topic = url.searchParams.get('topic');
        const category = url.searchParams.get('category');
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        const limit = parseInt(url.searchParams.get('limit') || '50');

        const where: any = {};

        // Filter by topic
        if (topic) {
            where.topic = {
                contains: topic,
                mode: 'insensitive'
            };
        }

        // Filter by category
        if (category) {
            where.category = {
                contains: category,
                mode: 'insensitive'
            };
        }

        // Filter by date range
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }

        const summaryArticles = await prisma.summaryArticle.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return json({
            success: true,
            count: summaryArticles.length,
            data: summaryArticles
        });
    } catch (error: any) {
        console.error('Error fetching summary articles:', error);
        return json(
            {
                success: false,
                error: 'Failed to fetch summary articles',
                message: error.message
            },
            { status: 500 }
        );
    }
};
