# BrightCheck Backend

A real-time fact-checking backend built on Bright Data's MCP platform. BrightCheck discovers relevant content across search engines and social platforms, accesses these sources via Bright Data's proxies, extracts structured evidence, and uses Gemini LLM to generate fact-checking verdicts.

## Features

- Real-time fact-checking with fresh data from across the web
- Multi-source evidence collection (news, social media, videos)
- Parallel processing with BullMQ job queue
- Integration with Bright Data's MCP platform
- Google Gemini LLM for analysis
- Structured storage with PostgreSQL

## Requirements

- [Bun](https://bun.sh) (v1.2.0+)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/) for job queuing
- [Bright Data Account](https://brightdata.com) with API Token
- [Google Gemini API](https://ai.google.dev/) key

## Setup Instructions

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

Update your `.env` file with:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/brightcheck"

# Redis for BullMQ
REDIS_URL="redis://localhost:6379"

# Bright Data MCP
BRIGHT_DATA_API_TOKEN="your_bright_data_api_token"
BRIGHT_DATA_WEB_UNLOCKER_ZONE="optional_custom_zone_name"
BRIGHT_DATA_BROWSER_AUTH="optional_browser_auth_string"

# Gemini API
GEMINI_API_KEY="your_gemini_api_key"

# Server
PORT=3000
NODE_ENV=development
```

### 3. Set Up Database

```bash
bun run prisma:generate  # Generate Prisma client
bun run prisma:migrate   # Create database tables
```

### 4. Start the Server

#### Development mode with hot reloading

```bash
bun run dev
```

#### Production mode

```bash
bun run start
```

## How It Works

1. The API receives a claim to fact-check
2. Multiple search queries are generated and processed in parallel:
   - Google web search
   - Google News
   - Twitter/X
   - Reddit
   - YouTube
   - Facebook
   - Instagram
3. Content is accessed via Bright Data's MCP server
4. Structured evidence is extracted from each source
5. Gemini LLM analyzes the evidence and provides a verdict
6. Results are stored in PostgreSQL and returned via API

## API Endpoints

- `POST /api/fact-check` - Submit a claim to fact-check
- `GET /api/fact-check/:id` - Get fact-check results
- `GET /api/fact-checks` - List all fact checks
- `GET /api/jobs/:id` - Check job status
- `GET /api/health` - Health check endpoint

## Bright Data MCP Integration

This application uses Bright Data's Model Context Protocol (MCP) server to access web data. The MCP server runs locally and interfaces with Bright Data's services to provide:

- Web search capabilities
- Access to websites with anti-bot protection
- Structured data extraction
- Browser automation when needed

For full functionality, you need a Bright Data account and API token.
