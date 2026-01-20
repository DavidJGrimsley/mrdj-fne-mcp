import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const guidesDir = path.join(__dirname, "..", "guides");
const resourcesDir = path.join(__dirname, "..", "resources");

type GuideSpec = {
  id: string;
  title: string;
  fileName: string;
  description: string;
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

// Define available guides
const GUIDES: GuideSpec[] = [
  {
    id: "getting-started",
    title: "Getting Started with Verse",
    fileName: "getting-started.md",
    description: "Introduction to Verse programming in Fortnite/UEFN"
  },
  {
    id: "verse-syntax",
    title: "Verse Syntax Guide",
    fileName: "verse-syntax.md",
    description: "Complete guide to Verse language syntax and features"
  },
  {
    id: "verse-api",
    title: "Verse API Reference",
    fileName: "verse-api.md",
    description: "Common Verse API patterns and examples"
  },
  {
    id: "best-practices",
    title: "Verse Best Practices",
    fileName: "best-practices.md",
    description: "Best practices for writing clean, efficient Verse code"
  },
  {
    id: "device-reference",
    title: "Device Reference",
    fileName: "device-reference.md",
    description: "Guide to using devices in Fortnite Creative"
  }
];

async function readGuide(guideId: string): Promise<string> {
  const guide = GUIDES.find((g) => g.id === guideId);
  if (!guide) {
    throw new Error(`Guide not found: ${guideId}`);
  }
  const guidePath = path.join(guidesDir, guide.fileName);
  return await readFile(guidePath, "utf-8");
}

const server = new McpServer(
  {
    name: "mrdj-fne-mcp",
    version: "0.1.0",
    description: "Verse programming guides and documentation for Fortnite/UEFN"
  },
  {
    capabilities: {
      resources: {},
      tools: {}
    }
  }
);

function toFileUri(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  return `file:///${normalized}`;
}

// Register each guide as a resource
GUIDES.forEach((guide) => {
  server.registerResource(
    guide.id,
    toFileUri(path.join(guidesDir, guide.fileName)),
    {
      title: guide.title,
      description: guide.description,
      mimeType: "text/markdown"
    },
    async () => {
      const content = await readGuide(guide.id);
      return {
        contents: [
          {
            uri: toFileUri(path.join(guidesDir, guide.fileName)),
            text: content
          }
        ]
      };
    }
  );
});

// Register tools
server.registerTool(
  "list_guides",
  {
    title: "List Verse Guides",
    description: "List all available Verse programming guides",
    inputSchema: z.object({})
  },
  async () => {
    const guidesList = GUIDES.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description
    }));
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(guidesList, null, 2)
        }
      ]
    };
  }
);

server.registerTool(
  "get_guide",
  {
    title: "Get Verse Guide",
    description: "Get the full content of a specific Verse guide by ID",
    inputSchema: z.object({
      guideId: z.string().min(1).describe("Guide ID (run list_guides to see options)")
    })
  },
  async (input: unknown) => {
    const parsed = z.object({ guideId: z.string().min(1) }).parse(input);
    const guide = GUIDES.find((g) => g.id === parsed.guideId);
    if (!guide) {
      return {
        content: [
          {
            type: "text",
            text: `Unknown guide ID: ${parsed.guideId}. Run list_guides to see available guides.`
          }
        ]
      };
    }
    const content = await readGuide(parsed.guideId);
    return {
      content: [
        {
          type: "text",
          text: `Guide: ${guide.title} (${guide.id})\n\n${content}`
        }
      ]
    };
  }
);

server.registerTool(
  "verse_syntax_help",
  {
    title: "Verse Syntax Help",
    description: "Get help with specific Verse syntax topics (variables, functions, classes, etc.)",
    inputSchema: z.object({
      topic: z.string().min(1).describe("Syntax topic (e.g., 'variables', 'functions', 'classes', 'loops')")
    })
  },
  async (input: unknown) => {
    const parsed = z.object({ topic: z.string().min(1) }).parse(input);
    const syntaxGuide = await readGuide("verse-syntax");
    const topicLower = parsed.topic.toLowerCase();
    
    // Extract relevant section from the syntax guide
    const lines = syntaxGuide.split("\n");
    const relevantLines: string[] = [];
    let capturing = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes(topicLower)) {
        capturing = true;
      }
      if (capturing) {
        relevantLines.push(line);
        // Stop at the next major heading or after 50 lines
        if (relevantLines.length > 1 && line.startsWith("## ") && !line.toLowerCase().includes(topicLower)) {
          break;
        }
        if (relevantLines.length > 50) {
          break;
        }
      }
    }
    
    const result = relevantLines.length > 0 
      ? relevantLines.join("\n")
      : `No specific information found for "${parsed.topic}". Try checking the full syntax guide.`;
    
    return {
      content: [
        {
          type: "text",
          text: result
        }
      ]
    };
  }
);

server.registerTool(
  "search_guides",
  {
    title: "Search Verse Guides",
    description: "Search through Verse guides for specific keywords or topics",
    inputSchema: z.object({
      query: z.string().min(1).describe("Search query")
    })
  },
  async (input: unknown) => {
    const parsed = z.object({ query: z.string().min(1) }).parse(input);
    const queryLower = parsed.query.toLowerCase();
    const results: Array<{ guide: string; matches: string[] }> = [];
    
    for (const guide of GUIDES) {
      try {
        const content = await readGuide(guide.id);
        const lines = content.split("\n");
        const matches: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(queryLower)) {
            // Include some context
            const start = Math.max(0, i - 1);
            const end = Math.min(lines.length, i + 2);
            const context = lines.slice(start, end).join("\n");
            matches.push(context);
            if (matches.length >= 3) break; // Limit matches per guide
          }
        }
        
        if (matches.length > 0) {
          results.push({
            guide: guide.title,
            matches
          });
        }
      } catch (error) {
        // Guide file doesn't exist yet, skip it
        continue;
      }
    }
    
    const resultText = results.length > 0
      ? results.map(r => `**${r.guide}**:\n${r.matches.join("\n\n---\n\n")}`).join("\n\n========\n\n")
      : `No results found for "${parsed.query}"`;
    
    return {
      content: [
        {
          type: "text",
          text: resultText
        }
      ]
    };
  }
);

// Parse command-line arguments
const args = process.argv.slice(2);
let httpPort: number | null = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--http-port" && i + 1 < args.length) {
    httpPort = parseInt(args[i + 1], 10);
  }
}

async function main() {
  if (httpPort) {
    // HTTP mode (Streamable HTTP + SSE fallback)
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Health check endpoint
    app.get("/health", (_req, res) => {
      res.json({
        status: "ok",
        server: PORTFOLIO_SERVER_ID,
        version: "0.1.0",
        started: SERVER_STARTED_AT
      });
    });

    // Portfolio endpoint
    app.get("/portfolio.json", (_req, res) => {
      res.json({
        server: PORTFOLIO_SERVER_ID,
        version: "0.1.0",
        description: "MCP server for Verse programming in Fortnite/UEFN",
        endpoints: {
          mcp: PORTFOLIO_MCP_ENDPOINT_URL,
          sse: PORTFOLIO_SSE_MESSAGES_URL,
          health: PORTFOLIO_HEALTH_URL,
          portfolio: PORTFOLIO_PORTFOLIO_URL
        },
        links: {
          info: PORTFOLIO_INFO_PAGE_URL,
          github: PORTFOLIO_GITHUB_REPO_URL
        },
        guides: GUIDES.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description
        }))
      });
    });

    // Store transports by session ID
    const transports: Record<string, StreamableHTTPServerTransport> = {};
    const sseTransports: Record<string, SSEServerTransport> = {};

    // MCP endpoint (Streamable HTTP + SSE fallback)
    app.all("/mcp", async (req, res) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      const acceptHeader = req.headers.accept || "";
      const isSseRequest = req.method === "GET" && acceptHeader.includes("text/event-stream") && !sessionId;

      if (isSseRequest) {
        // SSE mode for legacy clients
        const transport = new SSEServerTransport("/messages", res);
        const actualSessionId = transport.sessionId;
        sseTransports[actualSessionId] = transport;

        transport.onclose = () => {
          delete sseTransports[actualSessionId];
        };

        try {
          await server.connect(transport);
        } catch (error) {
          console.error("Error handling SSE MCP request:", error);
          delete sseTransports[actualSessionId];
          if (!res.headersSent) {
            res.status(500).json({ error: "Internal server error" });
          }
        }
        return;
      }

      // Streamable HTTP mode
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
      } else {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          onsessioninitialized: (newSessionId) => {
            transports[newSessionId] = transport;
          }
        });

        transport.onclose = () => {
          const sid = Object.keys(transports).find(k => transports[k] === transport);
          if (sid) {
            delete transports[sid];
          }
        };

        await server.connect(transport);
      }

      try {
        await transport.handleRequest(req, res);
      } catch (error) {
        console.error("Error handling MCP request:", error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Internal server error" });
        }
      }
    });

    // SSE Messages endpoint
    app.post("/messages", async (req, res) => {
      const sessionId = req.query.sessionId as string;
      const transport = sseTransports[sessionId];
      if (transport) {
        try {
          await transport.handlePostMessage(req, res);
        } catch (error) {
          console.error("Error handling SSE message:", error);
          if (!res.headersSent) {
            res.status(500).json({ error: "Internal server error" });
          }
        }
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    });

    app.listen(httpPort, () => {
      console.error(`MCP HTTP server listening on port ${httpPort}`);
      console.error(`Health check: http://localhost:${httpPort}/health`);
      console.error(`Portfolio: http://localhost:${httpPort}/portfolio.json`);
      console.error(`MCP endpoint: http://localhost:${httpPort}/mcp`);
    });
  } else {
    // Stdio mode (default)
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
