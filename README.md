# mrdj-fne-mcp

Model Context Protocol (MCP) server that surfaces Verse (UEFN) guidance, sample devices, and curated reference links as structured resources. Built to run locally (stdio) or behind an HTTP/SSE reverse proxy.

## Tech stack
- TypeScript + Node.js (ES modules)
- @modelcontextprotocol/sdk 1.25.x
- Express + CORS for HTTP/SSE mode

## What this MCP provides
- Verse guides in [guides/](guides/)
- Sample Verse devices in [resources/versebase/](resources/versebase/)
- Docs lookup tools for Epic and community resources

## Tools
- `list-guides` — list available Verse guides as MCP resources
- `get-guide` — return a full guide by id
- `search-guides` — search Verse guides by keyword
- `verse-syntax-help` — extract a topic section from the syntax guide
- `list-verse-files` — list Verse sample files
- `get-verse-file` — return a Verse sample file by id
- `search-verse` — search Verse samples by query
- `list-docs` — list known docs sources
- `search-docs` — search docs by id + query
- `fetch-web-doc` — fetch/search any URL
- `smart-help` — auto-select guides + docs for a question

## Run locally (stdio MCP)
1. Install Node.js 18+.
2. `npm install`
3. `npm run build`
4. `npm start`

## Run as HTTP server (for remote access)
```bash
npm run build
npm run start:http  # Starts on port 4001
curl http://localhost:4001/health
```

## VPS deployment (Plesk/nginx + PM2)
- Internal server runs on `127.0.0.1:4001`
- Public endpoints are path-prefixed under `/public-facing/mcp/mrdj-fne-mcp/*`

Use the Plesk-friendly reverse proxy snippet in [nginx.conf](nginx.conf).

## Notes / Improvements
- Consider splitting guides into smaller topical files as you grow the knowledge base.
- If you want richer Verse code search, consider indexing and fuzzy matching.
- Add more Verse samples under [resources/versebase/](resources/versebase/).

## Attribution
Verse documentation is provided by Epic Games. See the links in [guides/resources-and-learning.md](guides/resources-and-learning.md).
