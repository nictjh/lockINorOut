# SERP Article Fetcher

A module to fetch articles from search engines (SERP) on cybersecurity and artificial intelligence topics, and store them in a PostgreSQL database.

## Features

- 🔍 Fetch articles from DuckDuckGo search results
- 💾 Store articles in PostgreSQL database using Prisma
- 🚀 RESTful API to retrieve articles by topic and date
- 🔄 Automatic retry logic with exponential backoff
- 📊 Statistics and analytics endpoints

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

> First, create a PostgreSQL database and user. You can do this using Docker to spin up a container running PostgreSQL:

```bash
docker run --name serp-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=serfed -p 5432:5432 -d postgres
```

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
PORT=3000
```

### 3. Initialize Database

```bash
# Start Prisma dev server (if not already running)
npx prisma dev

# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

## Usage

### Fetch Articles

Run the article fetcher to scrape and store articles:

```bash
npm run build
npm start
```

This will:
- Fetch articles for "cybersecurity" and "artificial intelligence"
- Store them in the database (avoiding duplicates)
- Handle rate limiting with automatic retries

### Start API Server

Run the API server to access stored articles:

```bash
npm run dev:server
```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`)

## API Endpoints

### 1. Get All Articles (with filters)

```bash
GET /api/articles?topic=cybersecurity&startDate=2026-01-01&endDate=2026-01-31&limit=50
```

**Query Parameters:**
- `topic` (optional): Filter by topic (case-insensitive partial match)
- `startDate` (optional): Filter articles from this date (ISO format)
- `endDate` (optional): Filter articles until this date (ISO format)
- `limit` (optional): Maximum number of results (default: 50)

**Example:**
```bash
curl "http://localhost:3000/api/articles?topic=cyber&limit=10"
```

### 2. Get Articles by Topic

```bash
GET /api/articles/by-topic/:topic
```

**Example:**
```bash
curl "http://localhost:3000/api/articles/by-topic/cybersecurity"
curl "http://localhost:3000/api/articles/by-topic/artificial%20intelligence"
```

### 3. Get Articles by Date Range

```bash
GET /api/articles/by-date?startDate=2026-01-01&endDate=2026-01-31
```

**Example:**
```bash
curl "http://localhost:3000/api/articles/by-date?startDate=2026-01-15"
```

### 4. Get All Topics

```bash
GET /api/topics
```

**Example:**
```bash
curl "http://localhost:3000/api/topics"
```

### 5. Get Statistics

```bash
GET /api/stats
```

**Example:**
```bash
curl "http://localhost:3000/api/stats"
```

### 6. Health Check

```bash
GET /health
```

**Example:**
```bash
curl "http://localhost:3000/health"
```

## Testing Guide

### 1. Test Article Fetching

```bash
# Build and run the fetcher
npm run build
npm start
```

**Expected Output:**
```
Starting SERP article fetcher...
Fetching articles for topic: cybersecurity
Successfully fetched 10 results for cybersecurity
Found 10 articles for cybersecurity
Waiting 3 seconds before next topic...
Fetching articles for topic: artificial intelligence
Successfully fetched 10 results for artificial intelligence
Found 10 articles for artificial intelligence
Finished fetching and saving articles.
```

### 2. Test API Server

**Start the server:**
```bash
npm run dev:server
```

**Test with curl or browser:**

```bash
# Get all articles
curl http://localhost:3000/api/articles

# Get cybersecurity articles
curl http://localhost:3000/api/articles/by-topic/cybersecurity

# Get AI articles
curl "http://localhost:3000/api/articles/by-topic/artificial%20intelligence"

# Get articles from today
curl "http://localhost:3000/api/articles/by-date?startDate=$(date -I)"

# Get statistics
curl http://localhost:3000/api/stats

# Get all topics
curl http://localhost:3000/api/topics
```

### 3. Test with Postman or Thunder Client

Import these requests:

1. **GET** `http://localhost:3000/api/articles`
2. **GET** `http://localhost:3000/api/articles/by-topic/cybersecurity`
3. **GET** `http://localhost:3000/api/articles/by-date?startDate=2026-01-01`
4. **GET** `http://localhost:3000/api/stats`

## Database Schema

```prisma
model Article {
  id        Int      @id @default(autoincrement())
  title     String
  url       String   @unique
  snippet   String?
  topic     String
  source    String?
  createdAt DateTime @default(now())
}
```

## Project Structure

```
serp-fetcher/
├── src/
│   ├── index.ts      # Article fetcher script
│   ├── fetcher.ts    # SERP fetching logic
│   └── server.ts     # API server
├── prisma/
│   └── schema.prisma # Database schema
├── dist/             # Compiled JavaScript (generated)
├── .env              # Environment variables
├── package.json
└── tsconfig.json
```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the article fetcher
- `npm run server` - Run the API server (requires build first)
- `npm run dev:server` - Build and run the API server

## Troubleshooting

### Rate Limiting Issues

If you see "DDG detected an anomaly" errors:
- The fetcher includes automatic retry logic with exponential backoff
- Wait a few minutes between runs
- Consider using a different SERP API (e.g., SerpApi, ScraperAPI)

### Database Connection Issues

- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify Prisma dev server is running: `npx prisma dev`

### TypeScript Errors

```bash
# Regenerate Prisma Client
npx prisma generate

# Clean build
rm -rf dist
npm run build
```

## Future Enhancements

- [ ] Add more topics
- [ ] Schedule automatic fetching (cron job)
- [ ] Add pagination to API endpoints
- [ ] Add full-text search
- [ ] Add article content extraction
- [ ] Add email notifications for new articles
- [ ] Add authentication to API
