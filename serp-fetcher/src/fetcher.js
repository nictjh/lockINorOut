"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchArticles = fetchArticles;
const duck_duck_scrape_1 = require("duck-duck-scrape");
async function fetchArticles(topic) {
    console.log(`Fetching articles for topic: ${topic}`);
    try {
        const searchResults = await (0, duck_duck_scrape_1.search)(topic, {
            safeSearch: duck_duck_scrape_1.SafeSearchType.STRICT,
            time: 'w', // Articles from the past week (optional, adjust as needed)
        });
        if (searchResults.noResults) {
            console.log(`No results found for topic: ${topic}`);
            return [];
        }
        return searchResults.results.map((result) => ({
            title: result.title,
            url: result.url,
            description: result.description,
            source: result.hostname,
        }));
    }
    catch (error) {
        console.error(`Error fetching articles for topic ${topic}:`, error);
        return [];
    }
}
//# sourceMappingURL=fetcher.js.map