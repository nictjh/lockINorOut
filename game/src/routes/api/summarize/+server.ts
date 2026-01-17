import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

interface Article {
	id?: string;
	title: string;
	content: string;
	source?: string;
	url?: string;
}

interface SummarizedArticle {
	id?: string;
	title: string;
	summary: string;
	source?: string;
	url?: string;
	timestamp: string;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { articles } = await request.json();

		if (!articles || !Array.isArray(articles)) {
			return json(
				{ error: 'Invalid request: articles array required' },
				{ status: 400 }
			);
		}

		if (!process.env.OPENAI_API_KEY) {
			return json(
				{ error: 'OpenAI API key not configured' },
				{ status: 500 }
			);
		}

		// Summarize all articles in parallel
		const summaries = await Promise.all(
			articles.map((article) => summarizeArticle(article))
		);

		return json({
			success: true,
			summaries,
			count: summaries.length
		});
	} catch (error) {
		console.error('Summarization error:', error);
		return json(
			{ error: 'Failed to summarize articles' },
			{ status: 500 }
		);
	}
};

async function summarizeArticle(article: Article): Promise<SummarizedArticle> {
	const prompt = `You are a concise content summarizer. Read the following article and provide a 3-paragraph summary that:
- Takes 1-2 minutes to read
- Covers all main points and key takeaways
- Is interesting and engaging but factually accurate
- Uses clear, accessible language
- Includes relevant context and implications

Article Title: ${article.title}
Article Content:
${article.content}

Please provide ONLY the 3-paragraph summary, no additional text or formatting.`;

	try {
		const message = await openai.messages.create({
			model: 'claude-3-5-sonnet-20241022',
			max_tokens: 300,
			messages: [
				{
					role: 'user',
					content: prompt,
				},
			],
		});

		const summary =
			message.content[0].type === 'text' ? message.content[0].text : '';

		return {
			id: article.id,
			title: article.title,
			summary: summary.trim(),
			source: article.source,
			url: article.url,
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		console.error(`Error summarizing article "${article.title}":`, error);
		// Return placeholder if summarization fails
		return {
			id: article.id,
			title: article.title,
			summary: 'Summary temporarily unavailable. Please try again.',
			source: article.source,
			url: article.url,
			timestamp: new Date().toISOString(),
		};
	}
}