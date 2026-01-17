import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		// Fetch from serp-fetcher backend instead of direct DB connection
		const response = await fetch('http://localhost:3000/api/feed');
		
		if (!response.ok) {
			throw new Error(`serp-fetcher returned ${response.status}`);
		}

		const data = await response.json();
		return json(data);
	} catch (error) {
		console.error('Error fetching feed articles:', error);
		return json(
			{ error: 'Failed to fetch feed articles', details: (error as Error).message },
			{ status: 500 }
		);
	}
};
