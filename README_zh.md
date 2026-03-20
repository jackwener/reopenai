# ReopenAI

> 让所有 AI 工具互通互联。一个管理它们的 MCP Server。

[![Node.js Version](https://img.shields.io/node/v/reopenai?style=flat-square)](https://nodejs.org)

一个模型上下文协议（MCP）服务器，能够让 **任何兼容 MCP 的 AI 工具**（Claude Code, Cursor, Cline 等）通过统一的接口控制 **任何 AI 桌面客户端应用**（Antigravity, Cursor, Codex, ChatGPT, ChatWise, Grok）。

## 工作原理

```
Claude Code / Cursor / Cline / ...
        ↓ MCP 协议 (stdio)
    reopenai (本项目)
        ↓ child_process
    opencli <app> <command>
        ↓ CDP (Chrome DevTools Protocol)
    Electron AI 客户端 (Antigravity, Cursor, Codex, ...)
```

## 先决条件

1. 全局安装 **[opencli](https://github.com/jackwener/opencli)** 命令行工具：`npm i -g @jackwener/opencli`
2. 启动**目标 AI 应用**并开启 CDP 端口：
   ```bash
   # 示例：Antigravity
   /Applications/Antigravity.app/Contents/MacOS/Electron --remote-debugging-port=9224
   ```

## 快速上手

### 搭配 Claude Code 使用

在你的项目 `.mcp.json` 中添加：

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

### 搭配 Opencode 使用 (`~/.config/opencode/opencode.json`)

在 `mcp` 对象中添加：

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
- *"检查 Antigravity 是否连上"* → 调用 `ai_status`
- *"让 Cursor 写一个排序算法"* → 调用 `ai_ask`
- *"读取 ChatGPT 中最近的对话内容"* → 调用 `ai_read`

## 支持的应用

| 应用 | CDP 端口 | 支持的命令 |
|-----|----------|----------|
| **Antigravity** | 9224 | status, send, read, new, extract-code, model, watch |
| **Cursor** | 9226 | status, send, read, new, ask, model, extract-code, screenshot, history, export |
| **Codex** | 9222 | status, send, read, new, ask, model, extract-diff, screenshot, history, export |
| **ChatGPT** | 9224 | status, send, read, new, ask |
| **ChatWise** | 9228 | status, send, read, new, ask, model, screenshot, history, export |
| **Grok** | 9234 | ask, debug |

## MCP 工具列表

| 工具 | 描述 |
|------|-------------|
| `ai_list_apps` | 列出所有支持的 AI 应用及其功能 |
| `ai_status` | 检查 CDP 连接状态 |
| `ai_send` | 向 AI 应用发送消息 |
| `ai_read` | 读取历史对话内容 |
| `ai_ask` | 发送提示词并等待它生成完整回复 |
| `ai_new` | 开启新对话 |
| `ai_model` | 切换大语言模型 |
| `ai_extract_code` | 从对话中提取代码块 |
| `ai_screenshot` | 截取应用界面的屏幕截图 |
| `ai_history` | 获取历史会话列表 |
| `ai_export` | 导出对话数据 |

## 开发指南

```bash
git clone git@github.com:jackwener/reopenai.git
cd reopenai
npm install
npm run build
```

## 许可协议

Apache-2.0
