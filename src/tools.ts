/**
 * Tool definitions for the MCP server.
 *
 * Unified interface: every tool takes an `app` parameter to select the target AI application.
 */

import { z } from 'zod';
import { runOpencli, runOpencliRaw, type ExecResult } from './executor.js';

// ── Supported apps and their capabilities ────────────────────────────────────

export interface AppCapabilities {
  displayName: string;
  cdpPort: number;
  commands: string[];
}

export const SUPPORTED_APPS: Record<string, AppCapabilities> = {
  antigravity: {
    displayName: 'Antigravity',
    cdpPort: 9224,
    commands: ['status', 'send', 'read', 'new', 'extract-code', 'model', 'watch', 'dump'],
  },
  cursor: {
    displayName: 'Cursor',
    cdpPort: 9226,
    commands: ['status', 'send', 'read', 'new', 'ask', 'model', 'extract-code', 'screenshot', 'history', 'export', 'composer', 'dump'],
  },
  codex: {
    displayName: 'Codex',
    cdpPort: 9222,
    commands: ['status', 'send', 'read', 'new', 'ask', 'model', 'extract-diff', 'screenshot', 'history', 'export', 'dump'],
  },
  chatgpt: {
    displayName: 'ChatGPT',
    cdpPort: 9224,
    commands: ['status', 'send', 'read', 'new', 'ask'],
  },
  chatwise: {
    displayName: 'ChatWise',
    cdpPort: 9228,
    commands: ['status', 'send', 'read', 'new', 'ask', 'model', 'screenshot', 'history', 'export'],
  },
  grok: {
    displayName: 'Grok',
    cdpPort: 9234,
    commands: ['ask', 'debug'],
  },
};

const APP_NAMES = Object.keys(SUPPORTED_APPS) as [string, ...string[]];

// ── Schemas ──────────────────────────────────────────────────────────────────

const AppSchema = z.enum(APP_NAMES).describe(
  'Target AI application. Available: ' + APP_NAMES.join(', ')
);

// ── Helper ───────────────────────────────────────────────────────────────────

function checkAppCommand(app: string, command: string): string | null {
  const caps = SUPPORTED_APPS[app];
  if (!caps) return `Unknown app: ${app}. Available: ${APP_NAMES.join(', ')}`;
  if (!caps.commands.includes(command)) {
    return `App "${app}" does not support "${command}". Available commands: ${caps.commands.join(', ')}`;
  }
  return null;
}

function envForApp(app: string): Record<string, string> {
  const caps = SUPPORTED_APPS[app];
  if (!caps) return {};
  return { OPENCLI_CDP_ENDPOINT: `http://127.0.0.1:${caps.cdpPort}` };
}

function formatResult(result: ExecResult): { content: Array<{ type: 'text'; text: string }>; isError?: boolean } {
  if (!result.success) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${result.error}` }],
      isError: true,
    };
  }
  const text = typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2);
  return { content: [{ type: 'text' as const, text }] };
}

// ── Tool definitions ─────────────────────────────────────────────────────────

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  handler: (args: any) => Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }>;
}

export const tools: ToolDef[] = [
  // ── ai_list_apps ──
  {
    name: 'ai_list_apps',
    description: 'List all supported AI applications and their capabilities',
    inputSchema: z.object({}),
    handler: async () => {
      const list = Object.entries(SUPPORTED_APPS).map(([id, caps]) => ({
        id,
        name: caps.displayName,
        cdpPort: caps.cdpPort,
        commands: caps.commands,
      }));
      return { content: [{ type: 'text' as const, text: JSON.stringify(list, null, 2) }] };
    },
  },

  // ── ai_status ──
  {
    name: 'ai_status',
    description: 'Check CDP connection status for an AI application. Returns connection state, URL, and title.',
    inputSchema: z.object({
      app: AppSchema,
    }),
    handler: async (args: { app: string }) => {
      const err = checkAppCommand(args.app, 'status');
      if (err) return { content: [{ type: 'text' as const, text: err }], isError: true };
      const result = await runOpencli([args.app, 'status'], { env: envForApp(args.app) });
      return formatResult(result);
    },
  },

  // ── ai_send ──
  {
    name: 'ai_send',
    description: 'Send a message to an AI application. Injects text into the chat input and presses Enter.',
    inputSchema: z.object({
      app: AppSchema,
      message: z.string().describe('The message text to send'),
    }),
    handler: async (args: { app: string; message: string }) => {
      const err = checkAppCommand(args.app, 'send');
      if (err) return { content: [{ type: 'text' as const, text: err }], isError: true };
      const result = await runOpencli([args.app, 'send', args.message], { env: envForApp(args.app) });
      return formatResult(result);
    },
  },

  // ── ai_read ──
  {
    name: 'ai_read',
    description: 'Read the current conversation / chat history from an AI application.',
    inputSchema: z.object({
      app: AppSchema,
    }),
    handler: async (args: { app: string }) => {
      const err = checkAppCommand(args.app, 'read');
      if (err) return { content: [{ type: 'text' as const, text: err }], isError: true };
      const result = await runOpencli([args.app, 'read'], { env: envForApp(args.app) });
      return formatResult(result);
    },
  },

  // ── ai_ask ──
  {
    name: 'ai_ask',
    description: 'Send a prompt to an AI app and wait for the response. Combines send + wait + read. Returns both the user prompt and AI response.',
    inputSchema: z.object({
      app: AppSchema,
      prompt: z.string().describe('The prompt to send'),
      timeout: z.number().optional().default(60).describe('Max seconds to wait for response (default: 60)'),
    }),
    handler: async (args: { app: string; prompt: string; timeout: number }) => {
      const err = checkAppCommand(args.app, 'ask');
      if (err) return { content: [{ type: 'text' as const, text: err }], isError: true };
      const result = await runOpencli(
        [args.app, 'ask', args.prompt, '--timeout', String(args.timeout)],
        { env: envForApp(args.app), timeout: (args.timeout + 10) * 1000 }
      );
      return formatResult(result);
    },
  },

  // ── ai_new ──
  {
    name: 'ai_new',
    description: 'Start a new conversation / clear chat history in an AI application.',
    inputSchema: z.object({
      app: AppSchema,
    }),
    handler: async (args: { app: string }) => {
      const err = checkAppCommand(args.app, 'new');
      if (err) return { content: [{ type: 'text' as const, text: err }], isError: true };
      const result = await runOpencli([args.app, 'new'], { env: envForApp(args.app) });
      return formatResult(result);
    },
  },

  // ── ai_model ──
  {
    name: 'ai_model',
    description: 'Switch the active LLM model in an AI application (e.g., "claude", "gpt-4", "gemini").',
    inputSchema: z.object({
      app: AppSchema,
      model: z.string().describe('Model name to switch to'),
    }),
    handler: async (args: { app: string; model: string }) => {
      const err = checkAppCommand(args.app, 'model');
      if (err) return { content: [{ type: 'text' as const, text: err }], isError: true };
      const result = await runOpencli([args.app, 'model', args.model], { env: envForApp(args.app) });
      return formatResult(result);
    },
  },

  // ── ai_extract_code ──
  {
    name: 'ai_extract_code',
    description: 'Extract code blocks from the AI conversation. Returns all code snippets found in the chat.',
    inputSchema: z.object({
      app: AppSchema,
    }),
    handler: async (args: { app: string }) => {
      const err = checkAppCommand(args.app, 'extract-code');
      if (err) return { content: [{ type: 'text' as const, text: err }], isError: true };
      const result = await runOpencli([args.app, 'extract-code'], { env: envForApp(args.app) });
      return formatResult(result);
    },
  },

  // ── ai_screenshot ──
  {
    name: 'ai_screenshot',
    description: 'Take a screenshot of the AI application window. Returns base64-encoded image.',
    inputSchema: z.object({
      app: AppSchema,
    }),
    handler: async (args: { app: string }) => {
      const err = checkAppCommand(args.app, 'screenshot');
      if (err) return { content: [{ type: 'text' as const, text: err }], isError: true };
      const result = await runOpencliRaw([args.app, 'screenshot'], { env: envForApp(args.app) });
      return formatResult(result);
    },
  },

  // ── ai_history ──
  {
    name: 'ai_history',
    description: 'Get conversation history list from an AI application.',
    inputSchema: z.object({
      app: AppSchema,
    }),
    handler: async (args: { app: string }) => {
      const err = checkAppCommand(args.app, 'history');
      if (err) return { content: [{ type: 'text' as const, text: err }], isError: true };
      const result = await runOpencli([args.app, 'history'], { env: envForApp(args.app) });
      return formatResult(result);
    },
  },

  // ── ai_export ──
  {
    name: 'ai_export',
    description: 'Export the current conversation from an AI application as structured data.',
    inputSchema: z.object({
      app: AppSchema,
    }),
    handler: async (args: { app: string }) => {
      const err = checkAppCommand(args.app, 'export');
      if (err) return { content: [{ type: 'text' as const, text: err }], isError: true };
      const result = await runOpencli([args.app, 'export'], { env: envForApp(args.app) });
      return formatResult(result);
    },
  },
];
