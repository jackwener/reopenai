# ReopenAI

> 让所有 AI 工具互通互联。将任何桌面 AI 客户端转化为标准 API 和 MCP Server。

[![Node.js Version](https://img.shields.io/node/v/reopenai?style=flat-square)](https://nodejs.org)

ReopenAI 是一个统一桥梁，让 **任何 AI 编码助手/前端工具**（Claude Code, Cursor, Cline 等）都能直接白嫖/控制 **任何付费 AI 桌面客户端应用**（Antigravity, Cursor, Codex, ChatGPT, ChatWise, Grok）。

我们提供**两种核心接入方式**，满足不同场景需求：

## 方式一：作为原生大模型提供者 (API Proxy) —— 🌟 强烈推荐

这是将桌面 AI（如 Antigravity）直接作为核心大脑的最强大方式！我们启动一个兼容 Anthropic `/v1/messages` 的代理服务，让你的编码工具以为它在和官方面发请求，实际上是在白嫖本地客户端！

### 使用流程

1. 启动**目标 AI 应用**（需开启 CDP 调试端口）：
   ```bash
   /Applications/Antigravity.app/Contents/MacOS/Electron --remote-debugging-port=9224
   ```

2. 使用 [opencli](https://github.com/jackwener/opencli) 启动原生 API 代理：
   ```bash
   npm i -g @jackwener/opencli
   OPENCLI_CDP_ENDPOINT=http://127.0.0.1:9224 opencli antigravity serve --port 8082
   ```

3. **直接连接使用**（以 Claude Code 为例）：
   ```bash
   ANTHROPIC_BASE_URL=http://localhost:8082 claude
   ```

🎉 **完美体验**：
- 支持自动感知并点击 `New Conversation` 防止上下文混淆！
- 无缝将传入的标准化模型标识（如 `claude-3-7-sonnet-20250219` 或 `gemini-1.5-pro`）自动映射并切换为 UI 中的真实模型！
- 精准解析生成状态，秒速返回结果，无需依赖 MCP 工具等待交互！

---

## 方式二：作为 MCP 工具服务器 (MCP Server)

如果你不想把本地桌面 AI 当作底层大模型，而是希望**当作外部辅助工具来调用**（例如“帮我去 ChatGPT 查一下历史记录”），你可以通过 MCP（Model Context Protocol）接入。

### 工作原理
```
Claude Code / Cursor / Cline / ...
        ↓ MCP 协议 (stdio)
    reopenai (本项目)
        ↓ child_process
    opencli <app> <command>
        ↓ CDP 协议
    Electron AI 客户端
```

### 快速上手

在你的项目中添加 `.mcp.json`：
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

接入后，你可以让 AI 助手调用以下 MCP 工具与各大桌面客户端互动：
- *"检查 Antigravity 是否连上"* → 调用 `ai_status`
- *"让 Cursor 写一个排序算法"* → 调用 `ai_ask`
- *"读取 ChatGPT 中最近的对话内容"* → 调用 `ai_read`

## 支持的应用大全

| 应用 | CDP 端口 | 支持的命令 (MCP 侧) |
|-----|----------|----------|
| **Antigravity** | 9224 | status, serve(http proxy), send, read, new, extract-code, model, watch |
| **Cursor** | 9226 | status, send, read, new, ask, model, extract-code, screenshot, history, export |
| **Codex** | 9222 | status, send, read, new, ask, model, extract-diff, screenshot, history, export |
| **ChatGPT** | 9224 | status, send, read, new, ask |
| **ChatWise** | 9228 | status, send, read, new, ask, model, screenshot, history, export |
| **Grok** | 9234 | ask, debug |

## 完整 MCP 工具列表

| 工具名称 | 描述 |
|------|-------------|
| `ai_list_apps` | 列出所有支持的 AI 应用及其功能 |
| `ai_status` | 检查 CDP 连接状态 |
| `ai_send` | 向 AI 应用发送文本消息 (不等待返回) |
| `ai_read` | 读取最新的对话记录 |
| `ai_ask` | 提出需求并轮询等待获取最终回复 |
| `ai_new` | 点击新建对话按钮 |
| `ai_model` | 切换桌面端内的大语言模型 |
| `ai_extract_code` | 提取 AI 返回的代码块 |
| `ai_screenshot` | 截取桌面应用的屏幕画面 |
| `ai_history` | 获取所有历史会话列表 |
| `ai_export` | 导出整体对话数据 |

## 开发指南

```bash
git clone git@github.com:jackwener/reopenai.git
cd reopenai
npm install
npm run build
```

## 许可协议
Apache-2.0
