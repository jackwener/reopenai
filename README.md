# ReopenAI

> Make all AI tools interoperable. Turn any desktop AI client into a standard API endpoint and MCP Server.

[![npm version](https://img.shields.io/npm/v/@jackwener/reopenai.svg?style=flat-square)](https://www.npmjs.com/package/@jackwener/reopenai)
[![License](https://img.shields.io/npm/l/@jackwener/reopenai.svg?style=flat-square)](https://github.com/jackwener/reopenai/blob/main/LICENSE)

ReopenAI acts as a unified bridge, enabling **any AI coding assistant** (Claude Code, Cursor, Cline, etc.) to freely control and leverage **any subscription-based desktop AI app** (Antigravity, Cursor, Codex, ChatGPT, ChatWise, Grok).

We offer **two distinct integration methods**:

## Method 1: Native Model Provider (API Proxy) —— 🌟 recommended

This is the most powerful method. It treats your Desktop AI app (e.g., Antigravity) directly as the core backend brain. We launch a local Anthropic-compatible API proxy (`/v1/messages`) that routes standard inference requests seamlessly into the desktop app via CDP, making Claude Code think it's talking to the official endpoints!

### Usage

1. **Launch the target AI app** (with CDP debugging enabled):
   ```bash
   /Applications/Antigravity.app/Contents/MacOS/Electron --remote-debugging-port=9224
   ```

2. **Start the API Proxy** (using [opencli](https://github.com/jackwener/opencli)):
   ```bash
   npm i -g @jackwener/opencli
   OPENCLI_CDP_ENDPOINT=http://127.0.0.1:9224 opencli antigravity serve --port 8082
   ```

3. **Connect your tool** (Example with Claude Code):
   ```bash
   ANTHROPIC_BASE_URL=http://localhost:8082 claude
   ```

🎉 **Key Proxy Features**:
- Auto context isolation by detecting new sessions and actively hitting `New Conversation`.
- Automatic model translation: transparently maps incoming LLM names (e.g., `gemini-1.5-pro`, `claude-3-7-sonnet-20250219`) to actual dropdown UI elements and selects them automatically!
- Instant generation feedback by natively tracking interface rendering states.

---

## Method 2: MCP Server (Side Tooling)

If you already have a primary foundational LLM, and just want to treat your desktop AI as an **external tool/skill** (e.g. "Go find X in my ChatGPT history"), you can bridge them using the Model Context Protocol (MCP).

### How it Works
```
Claude Code / Cursor / Cline / ...
        ↓ MCP Protocol (stdio)
    reopenai (this project)
        ↓ child_process
    opencli <app> <command>
        ↓ CDP Protocol
    Electron AI Apps
```

### Quick Start

Add to your `.mcp.json`:
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

Once hooked up, your assistant can natively trigger these types of commands:
- *"Check if Antigravity is connected"* → calls `ai_status`
- *"Ask Cursor to write a sorting algorithm"* → calls `ai_ask`
- *"Read the latest conversation from ChatGPT"* → calls `ai_read`

## Supported Applications

| App | CDP Port | Supported Commands |
|-----|----------|----------|
| **Antigravity** | 9224 | status, serve(http proxy), send, read, new, extract-code, model, watch |
| **Cursor** | 9226 | status, send, read, new, ask, model, extract-code, screenshot, history, export |
| **Codex** | 9222 | status, send, read, new, ask, model, extract-diff, screenshot, history, export |
| **ChatGPT** | 9224 | status, send, read, new, ask |
| **ChatWise** | 9228 | status, send, read, new, ask, model, screenshot, history, export |
| **Grok** | 9234 | ask, debug |

## Complete MCP Tools Roster

| Tool | Description |
|------|-------------|
| `ai_list_apps` | List all supported AI apps and their capabilities |
| `ai_status` | Check CDP connection status |
| `ai_send` | Send a message to an AI app (does not wait for resolution) |
| `ai_read` | Read recent conversation history |
| `ai_ask` | Send prompt and track generation state reliably until completion |
| `ai_new` | Start a new conversation |
| `ai_model` | Switch active LLM dynamically |
| `ai_extract_code` | Extract code blocks |
| `ai_screenshot` | Take a screenshot of the app's viewport |
| `ai_history` | Get extensive conversation history lists |
| `ai_export` | Bulk export conversation data |

## Development

```bash
git clone git@github.com:jackwener/reopenai.git
cd reopenai
npm install
npm run build
```

## License
Apache-2.0
