import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import util from 'node:util';

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
		const body = await request.json();

		// Accept either single article or articles array
		const article = body.article || body;

		if (!article || !article.title || !article.content) {
			return json(
				{ error: 'Invalid request: article with title and content required' },
				{ status: 400 }
			);
		}

		if (!OPENAI_API_KEY) {
			return json(
				{ error: 'OpenAI API key not configured' },
				{ status: 500 }
			);
		}

		// Create OpenAI client and summarize
		const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
		const summary = await summarizeArticle(openai, article);

		return json({
			success: true,
			summary
		});
	} catch (error) {
		console.error('Summarization error:', error);
		return json(
			{ error: 'Failed to summarize article' },
			{ status: 500 }
		);
	}
};

async function summarizeArticle(
	openai: OpenAI,
	article: Article
): Promise<SummarizedArticle> {
	const prompt = `
You are a professional content summarizer.

Summarize the following article with these requirements:
- 3 to 4 short paragraphs
- About 1-2 minutes of reading time
- Clear, engaging, and easy to understand
- Factually accurate — do NOT invent details
- Explain key points, context, and implications
- Use an interesting hook in the opening paragraph

Article Title:
${article.title}

Article Content:
${article.content}

Output ONLY the summary text. Do not add headings, labels, or extra commentary.
`;

	try {
		const response = await openai.responses.create({
			model: 'gpt-4o-mini',
			input: prompt,
			max_output_tokens: 450,
		});

		console.log('[summarize] raw response:', util.inspect(response, {
			depth: 4,
			colors: false,
			maxArrayLength: 20,
		}));

		const summary = response.output_text?.trim() || 'Summary unavailable.';
		console.log('[summarize] summary length:', summary.length);

		return {
			id: article.id,
			title: article.title,
			summary,
			source: article.source,
			url: article.url,
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		console.error(`Error summarizing article "${article.title}":`, error);

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