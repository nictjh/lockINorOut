# IdleMode

**Combat doom scrolling. Stay focused. Lock in.**

IdleMode is a VS Code extension designed to keep your attention on your screen during those critical moments when you're waiting for Copilot or Codex to generate code. Instead of reaching for your phone and losing focus, IdleMode serves you a personalized feed of curated articles on topics you care about—keeping your mind engaged and your focus intact.

## The Problem

As a developer, those 1-2 minute wait times while Copilot generates code are productivity killers. The screen goes silent. Your brain gets restless. You reach for your phone. You doom scroll. By the time the code arrives, you've already mentally checked out. Getting back into flow state takes minutes.

**The result?** Fragmented focus, reduced productivity, and that nagging feeling that you're not truly "locked in."

## The Solution

IdleMode fills those idle moments with value in two ways:

**Option 1: Stay Sharp with Articles**
1. **Instant Feed Display** – Press `Cmd+Shift+G` (or trigger manually) to see a personalized feed
2. **Smart Scraping** – Automatically fetches articles from your configured websites and interests
3. **AI Summarization** – Articles are summarized into digestible 3-4 paragraph reads
4. **Stay Locked In** – Read relevant content without ever leaving VS Code

**Option 2: Decompress with Games**
When you're stressed, tired, or mentally drained, shift gears and play our fun, self-developed CS mini-games. Learn computer science terms in a lighthearted way while your brain gets a break from code.

Instead of doom scrolling on your phone, you're:
- Reading industry news relevant to your interests OR playing a fun CS game
- Learning something new (whether technical articles or CS fundamentals) in under 2 minutes
- Staying mentally engaged and ready to tackle the next task



## Features

### 🎯 Personalized Feed
Configure your interests and favorite sources in VS Code settings. IdleMode learns what matters to you.

### 🚀 One-Command Updates
Press **Cmd+Shift+G** to scrape 4 new articles from your configured websites, summarize them with AI, and add them to your feed instantly.

### 📖 AI-Powered Summaries
Uses OpenAI's GPT-4o-mini to create intelligent, readable summaries of full articles—no fluff, just the essentials.

### 🎮 CS Learning Game
When stress and fatigue hit, play our custom-built mini-games to learn computer science terms in a fun, interactive way. Master CS concepts wrongly! while taking a mental break from coding.

### 🔄 Smart Mode Switching
Seamlessly toggle between reading mode (for focused learning) and game mode (for stress relief and fun).

### ⚙️ Full Customization
- Choose your topics (e.g., "AI", "Startups", "Web Development")
- Select your sources (e.g., tldr.tech, Medium, Dev.to)
- Set preferences in VS Code settings

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nictjh/lockINorOut.git
cd lockINorOut
```

2. Install dependencies:
```bash
npm install
cd game && npm install
cd ../serp-fetcher && npm install
```

3. Set up environment variables:

**serp-fetcher/.env**
```
DATABASE_URL="postgresql://user:password@localhost:5432/your_db"
EXA_API_KEY="your_exa_api_key"
```

**game/.env**
```
OPENAI_API_KEY="your_openai_api_key"
DATABASE_URL="postgresql://user:password@localhost:5432/your_db"
VITE_SCRAPING_API_URL="http://localhost:3000/api/scrape-and-summarize"
```

4. Build and run the extension:
```bash
npm run compile
```

## Getting Started

### Start the Backend Services

**Terminal 1: Database + Backend API**
```bash
cd serp-fetcher
npm run build
npm run server  # Starts on http://localhost:3000
```

**Terminal 2: Game/Feed Frontend**
```bash
cd game
npm run dev  # Starts on http://localhost:5173
```

### Configure Your Preferences

1. Open VS Code Settings (`Cmd+,`)
2. Search for "IdleMode"
3. Configure:
   - **IdleMode: Interests** – Topics you care about (e.g., `["AI", "Startups", "Web Dev"]`)
   - **IdleMode: Websites** – Sources to scrape (e.g., `["tldr.tech", "medium.com", "dev.to"]`)

### Load the Extension

1. Open the extension workspace: `File > Open Folder > Select attemptVSCExt`
2. Press `F5` to launch the VS Code extension host
3. The extension loads automatically

### Use IdleMode

**Option 1: Manual Trigger**
```
Cmd+Shift+G  →  Scrape articles  →  View feed automatically
```

**Option 2: Command Palette**
```
Cmd+Shift+P  →  Search "IdleMode: Scrape and Update Feed"  →  Enter
```

## Architecture

```
VS Code Extension (IdleMode)
    ↓
    ├─ Reads configuration (interests, websites)
    └─ Calls API endpoint on Cmd+Shift+G
            ↓
    serp-fetcher Backend
        ├─ Exa API (search articles from websites)
        ├─ Fetch full content from article URLs
        ├─ OpenAI (summarize articles)
        └─ PostgreSQL (store summarized articles)
            ↓
    game Frontend (SvelteKit)
        ├─ Displays personalized feed
        ├─ Shows loading/error states
        └─ Renders in VS Code webview panel
```

### Core Components

**Extension (`src/extension.ts`)**
- Registers commands
- Handles keyboard shortcuts (Cmd+Shift+G)
- Makes API calls to scrape-and-summarize endpoint
- Manages webview display and overlay

**Backend API (`serp-fetcher/src/server.ts`)**
- `POST /api/scrape-and-summarize` – Scrape websites + summarize articles
- `GET /api/feed` – Retrieve all summarized articles

**Scraper (`serp-fetcher/src/fetcher.ts`)**
- Phase 1: Fetch article links from websites using Exa API
- Phase 2: Fetch full article content from URLs
- Phase 3: Summarize content using OpenAI

**Frontend (`game/src/routes/+page.svelte`)**
- Fetches feed from backend
- Displays articles in card layout
- Expandable summaries with read more functionality
- Loading and error states

**Database (`serp-fetcher/prisma/schema.prisma`)**
- `SummarizedArticle` model stores: title, summary, url, source, topic, timestamp

## API Endpoints

### Scrape and Summarize
```bash
POST /api/scrape-and-summarize
Content-Type: application/json

{
  "interests": ["AI", "Startups"],
  "websites": ["tldr.tech"]
}
```

**Response:**
```json
{
  "success": true,
  "articlesCount": 4,
  "articles": [
    {
      "id": "cuid...",
      "title": "Article Title",
      "summary": "3-4 paragraph summary...",
      "url": "https://...",
      "source": "tldr.tech",
      "timestamp": "2026-01-18T..."
    }
  ]
}
```

### Get Feed
```bash
GET /api/feed
```

**Response:**
```json
{
  "success": true,
  "articles": [...],
  "count": 4
}
```

## Configuration

Edit VS Code settings to personalize IdleMode:

```json
{
  "idlemode.interests": ["AI", "Startups", "Web Development"],
  "idlemode.websites": ["tldr.tech", "medium.com", "dev.to"]
}
```

Note: Don't include `https://` in website URLs. Just use `tldr.tech`, not `https://tldr.tech`.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+G` | Scrape new articles and update feed |
| `Cmd+Shift+P` + "IdleMode: Scrape and Update Feed" | Alternative trigger |

## How It Works

### Reading Mode (Focused Learning)
1. **You're waiting for Copilot** – Code generation is running
2. **Press Cmd+Shift+G** – IdleMode springs into action
3. **Backend scrapes** – Exa API searches your configured websites for articles matching your interests
4. **Content fetched** – Full article text is retrieved from each URL
5. **AI summarizes** – OpenAI creates concise 3-4 paragraph summaries
6. **Feed displays** – Articles appear in your VS Code webview instantly
7. **You read** – Stay engaged, maintain focus, learn something useful
8. **Code arrives** – You're ready to dive back in with fresh context

### Game Mode (Stress Relief)
1. **You're overwhelmed** – Deadlines, complex debugging, mental fatigue
2. **Open the game** – Switch to game mode for a mental reset
3. **Learn CS concepts** – Play engaging games about CS terms and fundamentals
4. **Decompress** – Have fun while reinforcing your knowledge
5. **Return refreshed** – Get back to work with renewed mental clarity

## Tech Stack

- **Frontend:** SvelteKit, Vite, TailwindCSS, Svelte
- **Backend:** Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **AI:** OpenAI API (GPT-4o-mini)
- **Search:** Exa API
- **Extension:** VS Code API, TypeScript

## Environment Variables

**serp-fetcher/.env**
```
DATABASE_URL=postgresql://user:password@localhost:5432/database
EXA_API_KEY=your_exa_api_key
```

**game/.env**
```
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=postgresql://user:password@localhost:5432/database
VITE_SCRAPING_API_URL=http://localhost:3000/api/scrape-and-summarize
VITE_APP_NAME=IdleMode
```

## Troubleshooting

**"Please configure IdleMode interests and websites in settings first"**
- Open VS Code Settings (`Cmd+,`)
- Search for "IdleMode"
- Add your interests and websites

**"Failed to connect to server"**
- Ensure serp-fetcher is running: `npm run server` in serp-fetcher directory
- Check it's on http://localhost:3000
- Verify your .env files are set up correctly

**"No articles found"**
- Verify your website domains are correct (e.g., `tldr.tech` not `https://tldr.tech`)
- Check EXA_API_KEY is valid in serp-fetcher/.env
- Verify PostgreSQL is running and DATABASE_URL is correct

**Articles not displaying in feed**
- Ensure game dev server is running: `npm run dev` in game directory
- Check OPENAI_API_KEY is set in game/.env
- Verify database connection string is correct

## Project Structure

```
attemptVSCExt/
├── src/
│   ├── extension.ts          # VS Code extension main file
│   └── test/
├── game/                      # SvelteKit frontend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── +page.svelte  # Feed display
│   │   │   └── api/
│   │   │       ├── feed/     # Feed endpoint
│   │   │       └── summarize/# Summarization endpoint
│   │   └── lib/
│   └── ...
├── serp-fetcher/             # Express backend
│   ├── src/
│   │   ├── server.ts         # API routes
│   │   ├── fetcher.ts        # Scraping logic
│   │   ├── index.ts          # Batch scraper
│   │   └── ...
│   ├── prisma/
│   │   └── schema.prisma     # Database models
│   └── ...
└── package.json
```

## Future Enhancements

**honestly a whole lot of possibilitiesss**

## Contributing

Found a bug? Want to help improve IdleMode? PRs are welcome!

## License

leCOOKEd

---

**Stay on screen. Stay sharp. Stay locked in.**

*Built with ❤️ by developers, for developers who refuse to doom scroll.*
