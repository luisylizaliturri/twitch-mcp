import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { initializeCredentials } from "./config/constants.js";
import { loadTokens } from "./auth/token-manager.js";
import { ensureValidToken } from "./auth/oauth.js";
import { registerAuthTools } from "./tools/auth-tools.js";
import { registerTwitchTools } from "./tools/twitch-tools.js";
// Check for client credentials in command line arguments
const clientId = process.argv[2];
const clientSecret = process.argv[3];
if (!clientId || !clientSecret) {
    console.error("Error: Client ID and Secret are required");
    console.error("Usage: node dist/index.js <client_id> <client_secret>");
    process.exit(1);
}
// Initialize the credentials in constants.ts
initializeCredentials(clientId, clientSecret);
// Create server instance
const server = new McpServer({
    name: "twitch_mcp",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Register MCP tools
registerAuthTools(server);
registerTwitchTools(server);
async function main() {
    console.error("Initializing Twitch MCP Server...");
    // Check for existing tokens first
    const hasValidToken = loadTokens();
    if (!hasValidToken) {
        console.error("No valid tokens found, initiating authorization flow...");
        await ensureValidToken();
    }
    else {
        console.error("Loaded existing access token");
    }
    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Twitch MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
