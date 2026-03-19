/**
 * Executor: runs opencli commands via child_process and parses JSON output.
 */

import { execFile } from 'node:child_process';

const DEFAULT_TIMEOUT = 60_000; // 60s

export interface ExecResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Execute an opencli command and return parsed JSON result.
 */
export async function runOpencli(
  args: string[],
  opts?: { timeout?: number; env?: Record<string, string> }
): Promise<ExecResult> {
  const timeout = opts?.timeout ?? DEFAULT_TIMEOUT;
  const env = { ...process.env, ...opts?.env };

  return new Promise((resolve) => {
    execFile('opencli', [...args, '-f', 'json'], { timeout, env }, (error, stdout, stderr) => {
      if (error) {
        // Try to extract useful error message
        const msg = stderr?.trim() || error.message;
        resolve({ success: false, error: msg });
        return;
      }

      try {
        const data = JSON.parse(stdout);
        resolve({ success: true, data });
      } catch {
        // If output isn't valid JSON, return raw text
        const text = stdout.trim();
        if (text) {
          resolve({ success: true, data: text });
        } else {
          resolve({ success: false, error: 'Empty response from opencli' });
        }
      }
    });
  });
}

/**
 * Run opencli for commands that return plain text (like extract-code, watch).
 */
export async function runOpencliRaw(
  args: string[],
  opts?: { timeout?: number; env?: Record<string, string> }
): Promise<ExecResult> {
  const timeout = opts?.timeout ?? DEFAULT_TIMEOUT;
  const env = { ...process.env, ...opts?.env };

  return new Promise((resolve) => {
    execFile('opencli', args, { timeout, env }, (error, stdout, stderr) => {
      if (error) {
        const msg = stderr?.trim() || error.message;
        resolve({ success: false, error: msg });
        return;
      }
      resolve({ success: true, data: stdout.trim() });
    });
  });
}
