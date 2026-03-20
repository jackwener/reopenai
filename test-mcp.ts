import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
  });

  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  console.log("Connecting...");
  await client.connect(transport);
  console.log("Connected!");

  console.log("\n--- Calling ai_status ---");
  const statusRes = await client.callTool({
    name: "ai_status",
    arguments: { app: "antigravity" },
  });
  console.log(JSON.stringify(statusRes, null, 2));

  console.log("\n--- Calling ai_send ---");
  const sendRes = await client.callTool({
    name: "ai_send",
    arguments: { app: "antigravity", message: "Hello from reopenai MCP Server! I am verifying the connection." },
  });
  console.log(JSON.stringify(sendRes, null, 2));

  console.log("\n--- Calling ai_read ---");
  const readRes = await client.callTool({
    name: "ai_read",
    arguments: { app: "antigravity" },
  });
  console.log(JSON.stringify(readRes, null, 2));

  process.exit(0);
}

main().catch(console.error);
