import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const guidesDir = path.join(__dirname, "..", "guides");
const verseBaseDir = path.join(__dirname, "..", "resources", "versebase");

type GuideSpec = {
  id: string;
  title: string;
  fileName: string;
  description: string;
  keywords: string[];
};

type VerseFileSpec = {
  id: string;
  title: string;
  fileName: string;
  description: string;
};

type DocsEntry = {
  id: string;
  title: string;
  urls: string[];
};

type PortfolioTool = {
  name: string;
  title: string;
  description: string;
  schema: Record<string, unknown>;
};

type PortfolioEndpoint = {
  id: string;
  title: string;
  method?: string;
  url: string;
  description?: string;
  transport?: string;
  contentType?: string;
};

const PORTFOLIO_SERVER_ID = "mrdj-fne-mcp";
const PUBLIC_MCP_BASE_URL = "https://davidjgrimsley.com/public-facing/mcp";
const PUBLIC_MCP_SERVER_BASE_URL = `${PUBLIC_MCP_BASE_URL}/${PORTFOLIO_SERVER_ID}`;
const PUBLIC_MCP_SERVER_PATH = `/public-facing/mcp/${PORTFOLIO_SERVER_ID}`;
const PORTFOLIO_MCP_ENDPOINT_URL = `${PUBLIC_MCP_SERVER_BASE_URL}/mcp`;
const PORTFOLIO_SSE_MESSAGES_URL = `${PUBLIC_MCP_SERVER_BASE_URL}/messages`;
const PORTFOLIO_HEALTH_URL = `${PUBLIC_MCP_SERVER_BASE_URL}/health`;
const PORTFOLIO_PORTFOLIO_URL = `${PUBLIC_MCP_SERVER_BASE_URL}/portfolio.json`;
const PORTFOLIO_INFO_PAGE_URL = `https://davidjgrimsley.com/mcp/${PORTFOLIO_SERVER_ID}`;
const PORTFOLIO_GITHUB_REPO_URL = "https://github.com/DavidJGrimsley/mrdj-fne-mcp";
const SERVER_STARTED_AT = new Date().toISOString();

const guides: GuideSpec[] = [
  {
    id: "index",
    title: "Index",
    fileName: "index.md",
    description: "Entry point for Verse guidance and references.",
    keywords: ["overview", "index", "start", "intro"]
  },
  {
    id: "getting-started",
    title: "Getting Started",
    fileName: "getting-started.md",
    description: "Intro to Verse and your first device.",
    keywords: ["getting started", "intro", "first", "beginner", "setup", "basics"]
  },
  {
    id: "verse-syntax",
    title: "Verse Syntax",
    fileName: "verse-syntax.md",
    description: "Complete syntax reference.",
    keywords: ["syntax", "types", "functions", "classes", "control flow", "specifiers"]
  },
  {
    id: "verse-api",
    title: "Verse API Reference",
    fileName: "verse-api.md",
    description: "Common modules and patterns.",
    keywords: ["api", "devices", "characters", "playspace", "simulation"]
  },
  {
    id: "device-reference",
    title: "Device Reference",
    fileName: "device-reference.md",
    description: "Common Fortnite Creative devices.",
    keywords: ["device", "button", "trigger", "timer", "item", "audio", "teleporter"]
  },
  {
    id: "verse-language-basics",
    title: "Verse Language Basics",
    fileName: "verse-language-basics.md",
    description: "Syntax, types, functions, and control flow.",
    keywords: ["syntax", "types", "functions", "loop", "race", "suspends", "async"]
  },
  {
    id: "uefn-workflow",
    title: "UEFN Workflow",
    fileName: "uefn-workflow.md",
    description: "Build/test loop and editor wiring tips.",
    keywords: ["uefn", "editor", "workflow", "session", "playtest"]
  },
  {
    id: "devices-and-gameplay",
    title: "Devices & Gameplay",
    fileName: "devices-and-gameplay.md",
    description: "Device composition, events, and gameplay loops.",
    keywords: ["device", "creative_device", "event", "gameplay", "cooldown"]
  },
  {
    id: "best-practices",
    title: "Best Practices",
    fileName: "best-practices.md",
    description: "Style, safety, and maintainability guidance.",
    keywords: ["best", "practices", "style", "performance", "maintain"]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    fileName: "troubleshooting.md",
    description: "Common errors and debugging tips.",
    keywords: ["debug", "error", "issue", "troubleshoot"]
  },
  {
    id: "resources-and-learning",
    title: "Resources & Learning",
    fileName: "resources-and-learning.md",
    description: "Curated Verse links.",
    keywords: ["resources", "learning", "reference", "docs"]
  },
  {
    id: "devices-and-events",
    title: "Devices & Events Checklist",
    fileName: "devices-and-events.md",
    description: "Checklist for device wiring and events.",
    keywords: ["checklist", "events", "subscribe", "await"]
  },
  {
    id: "verse-device-patterns",
    title: "Verse Device Patterns",
    fileName: "verse-device-patterns.md",
    description: "Common device patterns and structure.",
    keywords: ["patterns", "structure", "composition"]
  },
  {
    id: "uefn-setup",
    title: "UEFN Setup",
    fileName: "uefn-setup.md",
    description: "Project setup notes.",
    keywords: ["setup", "project", "install"]
  },
  {
    id: "faq",
    title: "FAQ",
    fileName: "faq.md",
    description: "Short FAQ for common questions.",
    keywords: ["faq", "questions"]
  }
];

const verseFiles: VerseFileSpec[] = [
  {
    id: "accolade-connector-device",
    title: "Accolade Connector Device",
    fileName: "accolade_connector_device.verse",
    description: "Awards accolades for vending machine events."
  },
  {
    id: "chest-device",
    title: "Chest Device",
    fileName: "chest_device.verse",
    description: "Cooldown chest with VFX and item grant."
  },
  {
    id: "custom-granter-device",
    title: "Custom Granter Device",
    fileName: "custom_granter_device.verse",
    description: "Simple button-triggered item grant."
  },
  {
    id: "health-regen-device",
    title: "Health Regen Snippet",
    fileName: "health_regen_device.verse",
    description: "Snippet for health regen during grind."
  },
  {
    id: "lucky-loot-device",
    title: "Lucky Loot Device",
    fileName: "lucky_loot_device.verse",
    description: "Random item granter with cooldown."
  },
  {
    id: "snow-device",
    title: "Snow Device",
    fileName: "snow_device.verse",
    description: "Seasonal snow phase controller."
  }
];

const docsRegistry: DocsEntry[] = [
  {
    id: "epic-verse",
    title: "Epic: Programming with Verse in UEFN",
    urls: ["https://dev.epicgames.com/documentation/en-us/fortnite/programming-with-verse-in-unreal-editor-for-fortnite"]
  },
  {
    id: "verse-language-reference",
    title: "Epic: Verse Language Reference",
    urls: ["https://dev.epicgames.com/documentation/en-us/fortnite/verse-language-reference"]
  },
  {
    id: "verse-quick-reference",
    title: "Epic: Verse Quick Reference",
    urls: ["https://dev.epicgames.com/documentation/en-us/fortnite/verse-language-quick-reference"]
  },
  {
    id: "verse-article",
    title: "Verse overview article (Medium)",
    urls: ["https://medium.com/@etirismagazine/verse-programming-language-9dbdb567d5ae"]
  },
  {
    id: "best-practices-thread",
    title: "UEFN best practices discussion",
    urls: ["https://forums.unrealengine.com/t/how-to-write-verse-the-correct-way-best-practices/2116958"]
  },
  {
    id: "childlike-verse",
    title: "Childlike Verse Playground",
    urls: ["https://childlike-verse-lang.web.app/"]
  },
  {
    id: "verse-talk",
    title: "Verse talk (Gotopia)",
    urls: ["https://gotopia.tech/sessions/2896/verse-a-new-functional-logic-language"]
  },
  {
    id: "community-language",
    title: "Community discussion on languages",
    urls: ["https://www.reddit.com/r/FortniteCreative/comments/1kt4r4z/what_programming_languages_would_be_helpful_for/"]
  },
  {
    id: "workshop-suggestion",
    title: "Workshop 2.0 suggestion (Overwatch forums)",
    urls: ["https://us.forums.blizzard.com/en/overwatch/t/suggestion-for-workshop-20-verse-programming-language/856117"]
  }
];

const PORTFOLIO_TOOLS: PortfolioTool[] = [
  {
    name: "list-guides",
    title: "List Verse Guides",
    description: "Return the available Verse guides as resource links",
    schema: {}
  },
  {
    name: "get-guide",
    title: "Get Verse Guide",
    description: "Return the full Markdown for a Verse guide",
    schema: {
      guideId: "string"
    }
  },
  {
    name: "search-guides",
    title: "Search Verse Guides",
    description: "Search through Verse guides for a keyword",
    schema: {
      query: "string",
      guideIds: "string[] (optional)",
      maxMatches: "number (optional)"
    }
  },
  {
    name: "verse-syntax-help",
    title: "Verse Syntax Help",
    description: "Extract a topic section from the Verse syntax guide",
    schema: {
      topic: "string"
    }
  },
  {
    name: "list-verse-files",
    title: "List Verse Files",
    description: "Return the available Verse sample files",
    schema: {}
  },
  {
    name: "get-verse-file",
    title: "Get Verse File",
    description: "Return the full Verse source for a sample file",
    schema: {
      fileId: "string"
    }
  },
  {
    name: "search-verse",
    title: "Search Verse Samples",
    description: "Search Verse sample files for a query",
    schema: {
      query: "string",
      fileIds: "string[] (optional)",
      maxMatches: "number (optional)"
    }
  },
  {
    name: "list-docs",
    title: "List Verse Docs",
    description: "List known docs sources by id (used by search-docs)",
    schema: {}
  },
  {
    name: "search-docs",
    title: "Search Verse Docs",
    description: "Search known docs sources by id without providing URLs",
    schema: {
      docId: "string",
      query: "string",
      maxMatchesPerUrl: "number (optional)",
      maxUrls: "number (optional)"
    }
  },
  {
    name: "fetch-web-doc",
    title: "Fetch / Search Web Docs",
    description: "Fetch a public documentation URL and optionally search it for a query",
    schema: {
      url: "string (URL)",
      query: "string (optional)",
      maxMatches: "number (optional)"
    }
  },
  {
    name: "smart-help",
    title: "Smart Help (Guides + Docs)",
    description: "Auto-select relevant Verse guides and query live docs sources",
    schema: {
      question: "string",
      preferGuides: "boolean (optional)",
      preferDocs: "boolean (optional)",
      guideIds: "string[] (optional)",
      docIds: "string[] (optional)",
      docQuery: "string (optional)",
      maxDocIds: "number (optional)",
      maxUrlsPerDoc: "number (optional)",
      maxMatchesPerUrl: "number (optional)",
      guideExcerptChars: "number (optional)"
    }
  }
];

const PORTFOLIO_ENDPOINTS: PortfolioEndpoint[] = [
  {
    id: "mcp-endpoint",
    title: "MCP Endpoint",
    method: "GET",
    url: PORTFOLIO_MCP_ENDPOINT_URL,
    description: "Primary MCP endpoint (Streamable HTTP + legacy SSE fallback).",
    transport: "streamable-http",
    contentType: "application/json"
  },
  {
    id: "sse-messages",
    title: "SSE Messages (POST)",
    method: "POST",
    url: PORTFOLIO_SSE_MESSAGES_URL,
    description: "SSE transport message endpoint (used by legacy SSE MCP clients).",
    transport: "sse",
    contentType: "application/json"
  },
  {
    id: "portfolio-json",
    title: "Portfolio Metadata (portfolio.json)",
    method: "GET",
    url: PORTFOLIO_PORTFOLIO_URL,
    description: "Metadata used by the portfolio UI (resources/tools/prompts).",
    contentType: "application/json"
  },
  {
    id: "health",
    title: "Health Check",
    method: "GET",
    url: PORTFOLIO_HEALTH_URL,
    description: "Server health status endpoint.",
    contentType: "application/json"
  },
  {
    id: "info-page",
    title: "Info Page",
    method: "GET",
    url: PORTFOLIO_INFO_PAGE_URL,
    description: "Human-readable MCP server overview page."
  },
  {
    id: "github-repo",
    title: "GitHub Repository",
    method: "GET",
    url: PORTFOLIO_GITHUB_REPO_URL,
    description: "Source code for the MCP server."
  }
];

const guideMap = new Map(guides.map((g) => [g.id, g]));
const verseFileMap = new Map(verseFiles.map((f) => [f.id, f]));
const docsMap = new Map(docsRegistry.map((d) => [d.id, d]));

function toFileUri(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  return `file:///${normalized}`;
}

async function loadGuide(fileName: string): Promise<{ uri: string; text: string }> {
  const filePath = path.join(guidesDir, fileName);
  const text = await readFile(filePath, "utf8");
  return { uri: toFileUri(filePath), text };
}

async function loadVerseFile(fileName: string): Promise<{ uri: string; text: string }> {
  const filePath = path.join(verseBaseDir, fileName);
  const text = await readFile(filePath, "utf8");
  return { uri: toFileUri(filePath), text };
}

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trimEnd()}…`;
}

function htmlToText(html: string): string {
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  const withoutStyles = withoutScripts.replace(/<style[\s\S]*?<\/style>/gi, "");
  const withLineBreaks = withoutStyles
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr)>/gi, "\n")
    .replace(/<(p|div|h1|h2|h3|h4|h5|h6|tr)[^>]*>/gi, "")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "");

  return withLineBreaks
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function findQuerySnippets(text: string, query: string, maxMatches: number): string[] {
  const haystack = text.toLowerCase();
  const needle = query.toLowerCase();
  if (!needle) return [];

  const snippets: string[] = [];
  let startIndex = 0;

  while (snippets.length < maxMatches) {
    const foundIndex = haystack.indexOf(needle, startIndex);
    if (foundIndex === -1) break;

    const contextBefore = 160;
    const contextAfter = 240;
    const from = Math.max(0, foundIndex - contextBefore);
    const to = Math.min(text.length, foundIndex + needle.length + contextAfter);
    const snippet = text.slice(from, to).replace(/\n+/g, " ").trim();
    snippets.push(`${from > 0 ? "…" : ""}${snippet}${to < text.length ? "…" : ""}`);

    startIndex = foundIndex + needle.length;
  }

  return snippets;
}

const PAGE_CACHE_TTL_MS = 10 * 60 * 1000;
const pageCache = new Map<string, { at: number; ok: boolean; status: number; text: string }>();

async function fetchPageText(url: string, timeoutMs: number): Promise<{ ok: boolean; status: number; text: string }> {
  const cached = pageCache.get(url);
  const now = Date.now();
  if (cached && now - cached.at < PAGE_CACHE_TTL_MS) {
    return { ok: cached.ok, status: cached.status, text: cached.text };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const raw = await response.text();
    const text = htmlToText(raw);
    const entry = { at: Date.now(), ok: response.ok, status: response.status, text };
    pageCache.set(url, entry);
    return { ok: response.ok, status: response.status, text };
  } catch (error) {
    const entry = { at: Date.now(), ok: false, status: 0, text: String(error) };
    pageCache.set(url, entry);
    return entry;
  } finally {
    clearTimeout(timeout);
  }
}

function selectGuideIds(question: string): string[] {
  const q = question.toLowerCase();
  const matches = guides.filter((g) => g.keywords.some((k) => q.includes(k.toLowerCase()))).map((g) => g.id);
  if (matches.length > 0) return Array.from(new Set(matches));
  return ["index"];
}

async function getPackageVersion(): Promise<string> {
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  try {
    const raw = await readFile(packageJsonPath, "utf8");
    const parsed = JSON.parse(raw) as { version?: string };
    return typeof parsed.version === "string" ? parsed.version : "0.0.0";
  } catch {
    return "0.0.0";
  }
}

const server = new McpServer(
  {
    name: "mrdj-fne-mcp",
    version: "0.1.0",
    description: "Verse (UEFN) guidance, sample devices, and reference links exposed as MCP resources."
  },
  {
    capabilities: {
      resources: {},
      prompts: {},
      tools: {}
    }
  }
);

for (const guide of guides) {
  server.registerResource(
    guide.id,
    toFileUri(path.join(guidesDir, guide.fileName)),
    {
      title: guide.title,
      description: guide.description,
      mimeType: "text/markdown"
    },
    async () => {
      const { uri, text } = await loadGuide(guide.fileName);
      return { contents: [{ uri, text }] };
    }
  );
}

for (const file of verseFiles) {
  server.registerResource(
    file.id,
    toFileUri(path.join(verseBaseDir, file.fileName)),
    {
      title: file.title,
      description: file.description,
      mimeType: "text/plain"
    },
    async () => {
      const { uri, text } = await loadVerseFile(file.fileName);
      return { contents: [{ uri, text }] };
    }
  );
}

server.registerTool(
  "list-guides",
  {
    title: "List Verse Guides",
    description: "Return the available Verse guides as resource links",
    inputSchema: {}
  },
  async () => {
    const listText = guides
      .map((guide) => `- ${guide.title} (${guide.description}) -> ${toFileUri(path.join(guidesDir, guide.fileName))}`)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Available Verse guides (open with readResource):\n${listText}`
        }
      ]
    };
  }
);

server.registerTool(
  "get-guide",
  {
    title: "Get Verse Guide",
    description: "Return the full Markdown for a Verse guide",
    inputSchema: z.object({
      guideId: z.string()
    })
  },
  async (input: unknown) => {
    const parsed = z.object({ guideId: z.string() }).parse(input);
    const guide = guideMap.get(parsed.guideId);
    if (!guide) {
      return { content: [{ type: "text", text: `Unknown guide id: ${parsed.guideId}` }] };
    }

    const { text } = await loadGuide(guide.fileName);
    return { content: [{ type: "text", text }] };
  }
);

server.registerTool(
  "search-guides",
  {
    title: "Search Verse Guides",
    description: "Search through Verse guides for a keyword",
    inputSchema: z.object({
      query: z.string(),
      guideIds: z.array(z.string()).optional(),
      maxMatches: z.number().optional()
    })
  },
  async (input: unknown) => {
    const parsed = z.object({
      query: z.string(),
      guideIds: z.array(z.string()).optional(),
      maxMatches: z.number().optional()
    }).parse(input);

    const maxMatches = parsed.maxMatches ?? 4;
    const targetGuides = parsed.guideIds?.length
      ? parsed.guideIds
          .map((id: string) => guideMap.get(id))
          .filter((g: GuideSpec | undefined): g is GuideSpec => Boolean(g))
      : guides;

    const results: string[] = [];
    for (const guide of targetGuides) {
      const { text } = await loadGuide(guide.fileName);
      const snippets = findQuerySnippets(text, parsed.query, maxMatches);
      if (snippets.length) {
        results.push(`## ${guide.title}\n${snippets.map((s) => `- ${s}`).join("\n")}`);
      }
    }

    if (!results.length) {
      return { content: [{ type: "text", text: `No matches for "${parsed.query}".` }] };
    }

    return { content: [{ type: "text", text: results.join("\n\n") }] };
  }
);

server.registerTool(
  "verse-syntax-help",
  {
    title: "Verse Syntax Help",
    description: "Extract a topic section from the Verse syntax guide",
    inputSchema: z.object({
      topic: z.string()
    })
  },
  async (input: unknown) => {
    const parsed = z.object({ topic: z.string() }).parse(input);
    const guide = guideMap.get("verse-syntax");
    if (!guide) {
      return { content: [{ type: "text", text: "Verse syntax guide not found." }] };
    }

    const { text } = await loadGuide(guide.fileName);
    const topicLower = parsed.topic.toLowerCase();
    const lines = text.split("\n");
    const collected: string[] = [];
    let capturing = false;

    for (const line of lines) {
      const isHeading = line.startsWith("## ");
      const matchesTopic = line.toLowerCase().includes(topicLower);

      if (!capturing && matchesTopic) {
        capturing = true;
      }

      if (capturing) {
        if (collected.length > 0 && isHeading && !matchesTopic) {
          break;
        }
        collected.push(line);
        if (collected.length >= 80) break;
      }
    }

    const result = collected.length ? collected.join("\n") : `No section found for "${parsed.topic}".`;
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "list-verse-files",
  {
    title: "List Verse Files",
    description: "Return the available Verse sample files",
    inputSchema: {}
  },
  async () => {
    const listText = verseFiles
      .map((file) => `- ${file.title} (${file.description}) -> ${toFileUri(path.join(verseBaseDir, file.fileName))}`)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Available Verse sample files (open with readResource):\n${listText}`
        }
      ]
    };
  }
);

server.registerTool(
  "get-verse-file",
  {
    title: "Get Verse File",
    description: "Return the full Verse source for a sample file",
    inputSchema: z.object({
      fileId: z.string()
    })
  },
  async (input: unknown) => {
    const parsed = z.object({ fileId: z.string() }).parse(input);
    const file = verseFileMap.get(parsed.fileId);
    if (!file) {
      return { content: [{ type: "text", text: `Unknown file id: ${parsed.fileId}` }] };
    }

    const { text } = await loadVerseFile(file.fileName);
    return { content: [{ type: "text", text }] };
  }
);

server.registerTool(
  "search-verse",
  {
    title: "Search Verse Samples",
    description: "Search Verse sample files for a query",
    inputSchema: z.object({
      query: z.string(),
      fileIds: z.array(z.string()).optional(),
      maxMatches: z.number().optional()
    })
  },
  async (input: unknown) => {
    const parsed = z.object({
      query: z.string(),
      fileIds: z.array(z.string()).optional(),
      maxMatches: z.number().optional()
    }).parse(input);

    const maxMatches = parsed.maxMatches ?? 5;
    const targetFiles = parsed.fileIds?.length
        ? parsed.fileIds
          .map((id: string) => verseFileMap.get(id))
          .filter((f: VerseFileSpec | undefined): f is VerseFileSpec => Boolean(f))
      : verseFiles;

    const results: string[] = [];
    for (const file of targetFiles) {
      const { text } = await loadVerseFile(file.fileName);
      const snippets = findQuerySnippets(text, parsed.query, maxMatches);
      if (snippets.length) {
        results.push(`## ${file.title}\n${snippets.map((s) => `- ${s}`).join("\n")}`);
      }
    }

    if (!results.length) {
      return { content: [{ type: "text", text: `No matches for "${parsed.query}".` }] };
    }

    return { content: [{ type: "text", text: results.join("\n\n") }] };
  }
);

server.registerTool(
  "list-docs",
  {
    title: "List Verse Docs",
    description: "List known docs sources by id (used by search-docs)",
    inputSchema: {}
  },
  async () => {
    const listText = docsRegistry.map((doc) => `- ${doc.id}: ${doc.title}`).join("\n");
    return {
      content: [
        {
          type: "text",
          text: `Known docs sources:\n${listText}`
        }
      ]
    };
  }
);

server.registerTool(
  "search-docs",
  {
    title: "Search Verse Docs",
    description: "Search known docs sources by id without providing URLs",
    inputSchema: z.object({
      docId: z.string(),
      query: z.string(),
      maxMatchesPerUrl: z.number().optional(),
      maxUrls: z.number().optional()
    })
  },
  async (input: unknown) => {
    const parsed = z.object({
      docId: z.string(),
      query: z.string(),
      maxMatchesPerUrl: z.number().optional(),
      maxUrls: z.number().optional()
    }).parse(input);

    const doc = docsMap.get(parsed.docId);
    if (!doc) {
      return { content: [{ type: "text", text: `Unknown doc id: ${parsed.docId}` }] };
    }

    const maxMatchesPerUrl = parsed.maxMatchesPerUrl ?? 5;
    const maxUrls = parsed.maxUrls ?? doc.urls.length;

    const snippets: string[] = [];
    const urls = doc.urls.slice(0, Math.max(1, maxUrls));
    for (const url of urls) {
      const page = await fetchPageText(url, 12000);
      if (!page.ok) {
        snippets.push(`- ${url} (failed with status ${page.status})`);
        continue;
      }

      const matches = findQuerySnippets(page.text, parsed.query, maxMatchesPerUrl);
      if (!matches.length) {
        snippets.push(`- ${url} (no matches)`);
        continue;
      }

      const excerpt = matches.map((m) => `  - ${m}`).join("\n");
      snippets.push(`- ${url}\n${excerpt}`);
    }

    return {
      content: [
        {
          type: "text",
          text: `Search results for "${parsed.query}" in ${doc.title}:\n${snippets.join("\n")}`
        }
      ]
    };
  }
);

server.registerTool(
  "fetch-web-doc",
  {
    title: "Fetch / Search Web Docs",
    description: "Fetch a public documentation URL and optionally search it for a query",
    inputSchema: z.object({
      url: z.string().url(),
      query: z.string().optional(),
      maxMatches: z.number().optional()
    })
  },
  async (input: unknown) => {
    const parsed = z.object({
      url: z.string().url(),
      query: z.string().optional(),
      maxMatches: z.number().optional()
    }).parse(input);

    const page = await fetchPageText(parsed.url, 12000);
    if (!page.ok) {
      return { content: [{ type: "text", text: `Failed to fetch ${parsed.url} (status ${page.status}).` }] };
    }

    if (!parsed.query) {
      return { content: [{ type: "text", text: truncateText(page.text, 4000) }] };
    }

    const maxMatches = parsed.maxMatches ?? 5;
    const matches = findQuerySnippets(page.text, parsed.query, maxMatches);
    const snippetText = matches.length ? matches.map((m) => `- ${m}`).join("\n") : "(no matches)";

    return {
      content: [
        {
          type: "text",
          text: `Matches for "${parsed.query}" in ${parsed.url}:\n${snippetText}`
        }
      ]
    };
  }
);

server.registerTool(
  "smart-help",
  {
    title: "Smart Help (Guides + Docs)",
    description: "Auto-select relevant Verse guides and query live docs sources",
    inputSchema: z.object({
      question: z.string(),
      preferGuides: z.boolean().optional(),
      preferDocs: z.boolean().optional(),
      guideIds: z.array(z.string()).optional(),
      docIds: z.array(z.string()).optional(),
      docQuery: z.string().optional(),
      maxDocIds: z.number().optional(),
      maxUrlsPerDoc: z.number().optional(),
      maxMatchesPerUrl: z.number().optional(),
      guideExcerptChars: z.number().optional()
    })
  },
  async (input: unknown) => {
    const parsed = z.object({
      question: z.string(),
      preferGuides: z.boolean().optional(),
      preferDocs: z.boolean().optional(),
      guideIds: z.array(z.string()).optional(),
      docIds: z.array(z.string()).optional(),
      docQuery: z.string().optional(),
      maxDocIds: z.number().optional(),
      maxUrlsPerDoc: z.number().optional(),
      maxMatchesPerUrl: z.number().optional(),
      guideExcerptChars: z.number().optional()
    }).parse(input);

    const preferGuides = parsed.preferGuides ?? true;
    const preferDocs = parsed.preferDocs ?? true;
    const guideIds = parsed.guideIds?.length ? parsed.guideIds : selectGuideIds(parsed.question);
    const docIds = parsed.docIds?.length ? parsed.docIds : docsRegistry.map((d) => d.id).slice(0, parsed.maxDocIds ?? 4);
    const docQuery = parsed.docQuery ?? parsed.question;
    const guideExcerptChars = parsed.guideExcerptChars ?? 800;
    const maxUrlsPerDoc = parsed.maxUrlsPerDoc ?? 3;
    const maxMatchesPerUrl = parsed.maxMatchesPerUrl ?? 4;

    const sections: string[] = [];

    if (preferGuides) {
      const guideSections: string[] = [];
      for (const guideId of guideIds) {
        const guide = guideMap.get(guideId);
        if (!guide) continue;
        const { text } = await loadGuide(guide.fileName);
        guideSections.push(`## ${guide.title}\n${truncateText(text.trim(), guideExcerptChars)}`);
      }
      if (guideSections.length) {
        sections.push(`# Guide excerpts\n${guideSections.join("\n\n")}`);
      }
    }

    if (preferDocs) {
      const docSections: string[] = [];
      for (const docId of docIds) {
        const doc = docsMap.get(docId);
        if (!doc) continue;
        const urls = doc.urls.slice(0, Math.max(1, maxUrlsPerDoc));
        const urlSnippets: string[] = [];
        for (const url of urls) {
          const page = await fetchPageText(url, 12000);
          if (!page.ok) {
            urlSnippets.push(`- ${url} (failed with status ${page.status})`);
            continue;
          }
          const matches = findQuerySnippets(page.text, docQuery, maxMatchesPerUrl);
          if (!matches.length) {
            urlSnippets.push(`- ${url} (no matches)`);
            continue;
          }
          urlSnippets.push(`- ${url}\n${matches.map((m) => `  - ${m}`).join("\n")}`);
        }
        docSections.push(`## ${doc.title}\n${urlSnippets.join("\n")}`);
      }
      if (docSections.length) {
        sections.push(`# Docs snippets\n${docSections.join("\n\n")}`);
      }
    }

    if (!sections.length) {
      return { content: [{ type: "text", text: "No guide or doc content was selected." }] };
    }

    return { content: [{ type: "text", text: sections.join("\n\n") }] };
  }
);

async function main() {
  const args = process.argv.slice(2);
  const httpPortIndex = args.indexOf("--http-port");
  const useHttp = httpPortIndex !== -1 && args[httpPortIndex + 1];

  if (useHttp) {
    const port = parseInt(args[httpPortIndex + 1], 10);
    if (Number.isNaN(port)) {
      console.error("Invalid port number");
      process.exit(1);
    }

    const app = express();
    app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
      })
    );

    const sseMessagesPathExternal = `${PUBLIC_MCP_SERVER_PATH}/messages`;
    const sseMessagesPathInternal = "/mcp/messages";

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path === sseMessagesPathExternal || req.path === sseMessagesPathInternal) {
        next();
      } else {
        express.json()(req, res, next);
      }
    });

    const transports: Record<string, StreamableHTTPServerTransport> = {};
    const sseTransports: Record<string, SSEServerTransport> = {};
    const sseHeartbeats: Record<string, NodeJS.Timeout> = {};

    app.get("/health", async (_req: Request, res: Response) => {
      res.set("Cache-Control", "no-store");
      res.json({ status: "ok", service: "mrdj-fne-mcp", version: await getPackageVersion() });
    });

    app.options("/portfolio.json", (_req: Request, res: Response) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.status(204).end();
    });

    app.get("/portfolio.json", async (req: Request, res: Response) => {
      try {
        const version = await getPackageVersion();
        const payload = {
          server: {
            id: PORTFOLIO_SERVER_ID,
            name: PORTFOLIO_SERVER_ID,
            version,
            mcpEndpointUrl: PORTFOLIO_MCP_ENDPOINT_URL,
            githubRepoUrl: PORTFOLIO_GITHUB_REPO_URL
          },
          resources: [
            ...guides.map((guide) => ({
              id: guide.id,
              title: guide.title,
              fileName: guide.fileName,
              description: guide.description
            })),
            ...verseFiles.map((file) => ({
              id: file.id,
              title: file.title,
              fileName: file.fileName,
              description: file.description
            }))
          ],
          tools: PORTFOLIO_TOOLS,
          prompts: [],
          endpoints: PORTFOLIO_ENDPOINTS,
          updatedAt: SERVER_STARTED_AT
        };

        const payloadStr = JSON.stringify(payload);
        const hash = createHash("sha1").update(payloadStr, "utf8").digest("hex");
        const etag = `"${hash.slice(0, 16)}"`;

        res.set("Cache-Control", "public, max-age=300");
        res.set("ETag", etag);

        const clientEtag = req.headers["if-none-match"];
        if (clientEtag === etag) {
          return res.status(304).end();
        }

        res.json(payload);
      } catch (error) {
        console.error("Error building /portfolio.json response:", error);
        res.status(500).json({ error: "portfolio_meta_failed" });
      }
    });

    app.all("/mcp", async (req: Request, res: Response) => {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      const acceptHeader = req.headers.accept || "";
      const isSseRequest = req.method === "GET" && acceptHeader.includes("text/event-stream") && !sessionId;

      if (isSseRequest) {
        const transport = new SSEServerTransport(sseMessagesPathExternal, res);
        const actualSessionId = transport.sessionId;
        sseTransports[actualSessionId] = transport;

        const heartbeatInterval = setInterval(() => {
          try {
            if (!res.writableEnded) {
              res.write(`:heartbeat\n\n`);
            } else {
              clearInterval(heartbeatInterval);
              delete sseHeartbeats[actualSessionId];
            }
          } catch {
            clearInterval(heartbeatInterval);
            delete sseHeartbeats[actualSessionId];
          }
        }, 30000);
        sseHeartbeats[actualSessionId] = heartbeatInterval;

        transport.onclose = () => {
          if (sseHeartbeats[actualSessionId]) {
            clearInterval(sseHeartbeats[actualSessionId]);
            delete sseHeartbeats[actualSessionId];
          }
          delete sseTransports[actualSessionId];
        };

        res.on("close", () => {
          if (sseHeartbeats[actualSessionId]) {
            clearInterval(sseHeartbeats[actualSessionId]);
            delete sseHeartbeats[actualSessionId];
          }
        });

        try {
          await server.connect(transport);
        } catch (error) {
          if (sseHeartbeats[actualSessionId]) {
            clearInterval(sseHeartbeats[actualSessionId]);
            delete sseHeartbeats[actualSessionId];
          }
          delete sseTransports[actualSessionId];
          if (!res.headersSent) {
            res.status(500).json({ error: "Internal server error" });
          }
        }
        return;
      }

      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
      } else {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (newSessionId: string) => {
            transports[newSessionId] = transport;
          }
        });

        transport.onclose = () => {
          const sid = Object.keys(transports).find((k) => transports[k] === transport);
          if (sid) delete transports[sid];
        };

        await server.connect(transport);
      }

      try {
        await transport.handleRequest(req, res);
      } catch (error) {
        if (!res.headersSent) {
          res.status(500).json({ error: "Internal server error" });
        }
      }
    });

    const handleSseMessage = async (req: Request, res: Response) => {
      const sessionId = req.query.sessionId as string;
      const transport = sseTransports[sessionId];
      if (transport) {
        try {
          await transport.handlePostMessage(req, res);
        } catch (error) {
          if (!res.headersSent) {
            res.status(500).json({ error: "Internal server error" });
          }
        }
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    };

    app.post(sseMessagesPathInternal, handleSseMessage);
    app.post(sseMessagesPathExternal, handleSseMessage);

    const httpServer = app.listen(port, () => {
      console.error(`mrdj-fne-mcp MCP server running on http://localhost:${port}`);
      console.error(`Health check: http://localhost:${port}/health`);
      console.error(`MCP endpoint: http://localhost:${port}/mcp`);
    });

    process.on("SIGTERM", () => {
      console.error("SIGTERM received, closing server");
      httpServer.close();
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("mrdj-fne-mcp MCP server running on stdio");
    process.stdin.resume();
  }
}

main().catch((error) => {
  console.error("Fatal error in main()", error);
  process.exit(1);
});
