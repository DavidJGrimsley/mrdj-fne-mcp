# mrdj-fne-mcp

An MCP (Model Context Protocol) server for **Verse programming** in Fortnite Creative and Unreal Editor for Fortnite (UEFN).

This server provides AI assistants with comprehensive guides, examples, and references for Verse development.

## Live Server

This MCP server runs on my VPS and can be accessed at:

- **MCP Endpoint**: https://davidjgrimsley.com/public-facing/mcp/mrdj-fne-mcp/mcp
- **Info Page**: https://davidjgrimsley.com/mcp/mrdj-fne-mcp
- **Health Check**: https://davidjgrimsley.com/public-facing/mcp/mrdj-fne-mcp/health

## What it is

A Model Context Protocol (MCP) server that provides:

- **Comprehensive Verse Programming Guides** - Getting started, syntax, API reference, best practices
- **Code Examples** - Real-world patterns for common Verse development tasks
- **Device Reference** - Complete guide to using Fortnite Creative devices with Verse
- **Search Functionality** - Quickly find relevant information across all guides
- **Interactive Tools** - MCP tools for accessing documentation and examples

## Features

### 📚 Resources

All guides are available as MCP resources that can be accessed directly:

- `verse://guides/getting-started` - Introduction to Verse programming
- `verse://guides/verse-syntax` - Complete syntax reference
- `verse://guides/verse-api` - API documentation and patterns
- `verse://guides/best-practices` - Best practices and code quality
- `verse://guides/device-reference` - Device usage guide

### 🛠️ Tools

The server provides the following MCP tools:

- **`list_guides`** - List all available Verse guides
- **`get_guide`** - Get the full content of a specific guide by ID
- **`verse_syntax_help`** - Get help with specific Verse syntax topics
- **`search_guides`** - Search through all guides for specific keywords

## Installation & Usage

### Local Development (stdio)

1. Install Node.js 18+
2. Clone and install dependencies:
   ```bash
   git clone https://github.com/DavidJGrimsley/mrdj-fne-mcp.git
   cd mrdj-fne-mcp
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Run in stdio mode:
   ```bash
   npm start
   ```

### HTTP Server (for remote access)

Start the server on port 4028:

```bash
npm run build
npm run start:http
```

Or in development mode with auto-reload:

```bash
npm run dev:http
```

Test the server:

```bash
curl http://localhost:4028/health
curl http://localhost:4028/portfolio.json
```

### Use with MCP Clients

Add to your MCP client configuration (e.g., Claude Desktop, VS Code with MCP extension):

**For local stdio mode:**

```json
{
  "mcpServers": {
    "mrdj-fne-mcp": {
      "command": "node",
      "args": ["/path/to/mrdj-fne-mcp/build/index.js"]
    }
  }
}
```

**For remote HTTP mode:**

```json
{
  "mcpServers": {
    "mrdj-fne-mcp": {
      "url": "https://davidjgrimsley.com/public-facing/mcp/mrdj-fne-mcp/mcp"
    }
  }
}
```

## VPS Deployment

### Prerequisites

- Node.js 18+
- PM2 (process manager)
- Nginx (reverse proxy)

### Deploy Script

Run the included deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

This will:
1. Install dependencies
2. Build the project
3. Start the server with PM2 on port 4028

### Nginx Configuration

The server runs internally on `127.0.0.1:4028`. Add the provided `nginx.conf` snippet to your Nginx configuration to expose it under `/public-facing/mcp/mrdj-fne-mcp/`.

Key endpoints:
- `/public-facing/mcp/mrdj-fne-mcp/mcp` - Main MCP endpoint
- `/public-facing/mcp/mrdj-fne-mcp/health` - Health check
- `/public-facing/mcp/mrdj-fne-mcp/portfolio.json` - Server metadata

## Guide Contents

### Getting Started with Verse

Introduction to Verse programming covering:
- What is Verse and why use it
- Setting up your first Verse project
- Basic concepts (variables, functions, classes)
- Common patterns and next steps

### Verse Syntax Guide

Complete language reference including:
- Comments and basic syntax
- Variables and constants (mutable vs immutable)
- Data types (primitives, optionals, arrays, maps, tuples)
- Functions and specifiers
- Classes and devices
- Control flow (if, for, loops)
- Collections and comprehensions
- Concurrency (sync, race, spawn)
- Error handling

### Verse API Reference

API documentation for core modules:
- `/Fortnite.com/Devices` - button_device, trigger_device, timer_device, etc.
- `/Fortnite.com/Characters` - fort_character, agent, player
- `/Fortnite.com/Game` - creative_device, fort_playspace
- `/Verse.org/Simulation` - Time, events, async operations
- Common patterns and examples

### Best Practices

Code quality and patterns:
- Code organization
- Immutability and functional programming
- Error handling
- Concurrency patterns
- Performance optimization
- Code clarity and documentation
- Testing and debugging

### Device Reference

Complete guide to Fortnite Creative devices:
- Interaction devices (buttons, triggers)
- Time and sequence devices (timers, cinematics)
- Items and inventory (grantors, spawners)
- Player effects (mutator zones)
- Environmental (collectibles)
- UI and display (billboards)
- Spawn and teleport
- Audio players
- Complex multi-device examples

## Example Usage

### Using with AI Assistants

Ask your AI assistant:

> "Show me how to create a button that grants an item when pressed in Verse"

> "What's the best practice for handling player respawns in Verse?"

> "Search the Verse guides for information about async operations"

The MCP server will provide relevant documentation and code examples.

### Tool Examples

**List available guides:**
```
Tool: list_guides
Response: Array of all available guides with IDs and descriptions
```

**Get a specific guide:**
```
Tool: get_guide
Input: { guideId: "getting-started" }
Response: Full markdown content of the Getting Started guide
```

**Get syntax help:**
```
Tool: verse_syntax_help
Input: { topic: "functions" }
Response: Relevant section from syntax guide about functions
```

**Search guides:**
```
Tool: search_guides
Input: { query: "button device" }
Response: All matching sections across guides
```

## Development

### Project Structure

```
mrdj-fne-mcp/
├── src/
│   └── index.ts          # Main MCP server implementation
├── guides/
│   ├── getting-started.md
│   ├── verse-syntax.md
│   ├── verse-api.md
│   ├── best-practices.md
│   └── device-reference.md
├── resources/            # Additional resources (if needed)
├── build/               # Compiled JavaScript output
├── package.json
├── tsconfig.json
├── deploy.sh           # Deployment script
└── nginx.conf         # Nginx configuration snippet
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run in stdio mode (for MCP clients)
- `npm run start:http` - Run HTTP server on port 4028
- `npm run dev` - Development mode with ts-node (stdio)
- `npm run dev:http` - Development mode with ts-node (HTTP)

## Contributing

This is a personal MCP server, but suggestions and improvements are welcome! Feel free to:

1. Open issues for bugs or suggestions
2. Submit pull requests with improvements
3. Share your own Verse guides or examples

## Resources

- [Official Verse Documentation](https://dev.epicgames.com/documentation/verse)
- [Fortnite Creative Documentation](https://dev.epicgames.com/documentation/fortnite-creative)
- [UEFN Documentation](https://dev.epicgames.com/documentation/uefn)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT License - See LICENSE file for details

## Attribution

This MCP server contains guides and documentation based on:
- Epic Games' official Verse and UEFN documentation
- Community best practices and patterns
- Personal experience and examples

Verse, Fortnite, and Unreal Engine are trademarks of Epic Games, Inc.
