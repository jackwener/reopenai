#!/usr/bin/env node
/**
 * ReopenAI — MCP Server that makes all AI tools interoperable.
 *
 * Exposes unified tools (ai_send, ai_read, ai_ask, ...) that proxy to opencli
 * commands for controlling any Electron-based AI desktop application via CDP.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { tools, SUPPORTED_APPS } from './tools.js';

const server = new McpServer({
  name: 'reopenai',
  version: '0.1.0',
});

// Register all tools with the MCP server
for (const tool of tools) {
  // McpServer.tool() expects: name, description, schema-shape, handler
  // We need to convert our zod schema to the shape record format
  const shape = (tool.inputSchema as any).shape ?? {};
  server.tool(tool.name, tool.description, shape, async (args: any) => {
    return tool.handler(args);
  });
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr so it doesn't interfere with MCP stdio communication
  const appList = Object.entries(SUPPORTED_APPS)
    .map(([id, caps]) => `${caps.displayName} (:${caps.cdpPort})`)
    .join(', ');
  console.error(`[reopenai] MCP server started. Supporting: ${appList}`);
}

main().catch((err) => {
  console.error('[reopenai] Fatal error:', err);
  process.exit(1);
});
