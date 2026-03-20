# ReopenAI

> Make all AI tools interoperable. One MCP server to control them all.

[![Node.js Version](https://img.shields.io/node/v/reopenai?style=flat-square)](https://nodejs.org)

A Model Context Protocol (MCP) server that lets **any MCP-compatible AI tool** (Claude Code, Cursor, Cline, etc.) control **any AI desktop application** (Antigravity, Cursor, Codex, ChatGPT, ChatWise, Grok) through a unified interface.

## How It Works

```
Claude Code / Cursor / Cline / ...
        ↓ MCP Protocol (stdio)
   reopenai (this project)
        ↓ child_process
   opencli <app> <command>
        ↓ CDP (Chrome DevTools Protocol)
   Electron AI Apps (Antigravity, Cursor, Codex, ...)
```

## Prerequisites

1. **[opencli](https://github.com/jackwener/opencli)** installed globally: `npm i -g @jackwener/opencli`
2. **Target AI app** launched with CDP enabled:
   ```bash
   # Example: Antigravity
   /Applications/Antigravity.app/Contents/MacOS/Electron --remote-debugging-port=9224
   ```

## Quick Start

### For Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "reopenai": {
      "command": "npx",
      "args": ["-y", "@jackwener/reopenai"]
    }
  }
}
```

### For Opencode (`~/.config/opencode/opencode.json`)

Add to the `mcp` object:

```json
{
  "mcp": {
    "reopenai": {
      "command": [
        "npx",
        "-y",
        "@jackwener/reopenai"
      ],
      "enabled": true,
      "type": "local"
    }
  }
}
```

然后，你可以使用类似的对话进行交互：
- *"Check if Antigravity is connected"* → calls `ai_status`
- *"Ask Cursor to write a sorting algorithm"* → calls `ai_ask`
- *"Read the latest conversation from ChatGPT"* → calls `ai_read`

## Supported Apps

| App | CDP Port | Commands |
|-----|----------|----------|
| **Antigravity** | 9224 | status, send, read, new, extract-code, model, watch |
| **Cursor** | 9226 | status, send, read, new, ask, model, extract-code, screenshot, history, export |
| **Codex** | 9222 | status, send, read, new, ask, model, extract-diff, screenshot, history, export |
| **ChatGPT** | 9224 | status, send, read, new, ask |
| **ChatWise** | 9228 | status, send, read, new, ask, model, screenshot, history, export |
| **Grok** | 9234 | ask, debug |

## MCP Tools

| Tool | Description |
|------|-------------|
| `ai_list_apps` | List all supported AI apps and their capabilities |
| `ai_status` | Check CDP connection status |
| `ai_send` | Send a message to an AI app |
| `ai_read` | Read conversation history |
| `ai_ask` | Send prompt and wait for response |
| `ai_new` | Start a new conversation |
| `ai_model` | Switch LLM model |
| `ai_extract_code` | Extract code blocks from conversation |
| `ai_screenshot` | Take a screenshot |
| `ai_history` | Get conversation history list |
| `ai_export` | Export conversation data |

## Development

```bash
git clone git@github.com:jackwener/reopenai.git
cd reopenai
npm install
npm run build
```

## License

Apache-2.0
