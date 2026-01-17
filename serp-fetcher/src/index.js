"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fetcher_1 = require("./fetcher");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
const prisma = new client_1.PrismaClient();
const TOPICS = ['cybersecurity', 'artificial intelligence'];
async function main() {
    console.log('Starting SERP article fetcher...');
    for (const topic of TOPICS) {
        const articles = await (0, fetcher_1.fetchArticles)(topic);
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
            }
            catch (e) {
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
//# sourceMappingURL=index.js.map