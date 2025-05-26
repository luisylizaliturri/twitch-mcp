import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadTokens } from "./auth/TokenManager.js";
import { ensureValidToken } from "./auth/oauth.js";
import { registerAuthTools } from "./tools/auth-tools.js";
import { registerTwitchTools } from "./tools/twitch-tools.js";

export async function startTwitchServer({
  clientId,
  clientSecret,
}: {
  clientId: string;
  clientSecret: string;
}) {
  if (!clientId || !clientSecret)
    throw new Error("clientId and clientSecret required");

  // Initialize the MCP server
  const server = new McpServer({
    name: "twitch_mcp",
    version: "1.0.0",
    capabilities: { resources: {}, tools: {} },
  });

  registerAuthTools(server);
  registerTwitchTools(server);

  if (!loadTokens()) {
    console.error("No valid tokens found → starting OAuth flow");
    await ensureValidToken();
  } else {
    console.error("Loaded existing access token");
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Twitch MCP Server running on stdio");
}
