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

async function listGuidesAsResources() {
  return GUIDES.map((guide) => ({
    uri: `verse://guides/${guide.id}`,
    name: guide.title,
    description: guide.description,
    mimeType: "text/markdown"
  }));
}

const server = new McpServer({
  name: "mrdj-fne-mcp",
  version: "0.1.0"
});

// Register resources (guides as resources)
server.resource_list(async () => {
  const guideResources = await listGuidesAsResources();
  return { resources: guideResources };
});

server.resource_read(async (request) => {
  const uri = request.params.uri;
  if (uri.startsWith("verse://guides/")) {
    const guideId = uri.replace("verse://guides/", "");
    const content = await readGuide(guideId);
    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: content
        }
      ]
    };
  }
  throw new Error(`Unknown resource: ${uri}`);
});

// Register tools
server.tool_list(async () => {
  return {
    tools: [
      {
        name: "list_guides",
        description: "List all available Verse programming guides",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "get_guide",
        description: "Get the full content of a specific Verse guide by ID",
        inputSchema: {
          type: "object",
          properties: {
            guideId: {
              type: "string",
              description: "The ID of the guide to retrieve",
              enum: GUIDES.map((g) => g.id)
            }
          },
          required: ["guideId"]
        }
      },
      {
        name: "verse_syntax_help",
        description: "Get help with specific Verse syntax topics (variables, functions, classes, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "The syntax topic to get help with (e.g., 'variables', 'functions', 'classes', 'loops', 'conditionals')"
            }
          },
          required: ["topic"]
        }
      },
      {
        name: "search_guides",
        description: "Search through Verse guides for specific keywords or topics",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query"
            }
          },
          required: ["query"]
        }
      }
    ]
  };
});

server.tool_call(async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "list_guides": {
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

    case "get_guide": {
      const guideId = z.string().parse(args.guideId);
      const content = await readGuide(guideId);
      return {
        content: [
          {
            type: "text",
            text: content
          }
        ]
      };
    }

    case "verse_syntax_help": {
      const topic = z.string().parse(args.topic);
      const syntaxGuide = await readGuide("verse-syntax");
      const topicLower = topic.toLowerCase();
      
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
        : `No specific information found for "${topic}". Try checking the full syntax guide.`;
      
      return {
        content: [
          {
            type: "text",
            text: result
          }
        ]
      };
    }

    case "search_guides": {
      const query = z.string().parse(args.query);
      const queryLower = query.toLowerCase();
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
        : `No results found for "${query}"`;
      
      return {
        content: [
          {
            type: "text",
            text: resultText
          }
        ]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

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

    // Streamable HTTP transport endpoint
    const httpTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    httpTransport.attach(server);

    app.get("/mcp", async (req, res) => {
      await httpTransport.handle(req, res);
    });

    app.post("/mcp", async (req, res) => {
      await httpTransport.handle(req, res);
    });

    // SSE transport endpoints (fallback for legacy clients)
    const sseTransport = new SSEServerTransport("/messages", res => res);
    sseTransport.attach(server);

    app.get("/messages", async (req, res) => {
      await sseTransport.handle(req, res);
    });

    app.post("/messages", async (req, res) => {
      await sseTransport.handle(req, res);
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
    transport.attach(server);
    await transport.start();
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
