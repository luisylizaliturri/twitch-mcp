import { ensureValidToken } from "../auth/oauth.js";
import { getAccessToken, getTokenExpiresAt } from "../auth/token-manager.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Register authentication-related tools
export function registerAuthTools(server: McpServer): void {
  server.tool(
    "authenticate",
    "Manually trigger Twitch authentication",
    {},
    async () => {
      await ensureValidToken();
      const accessToken = getAccessToken();

      return {
        content: [
          {
            type: "text",
            text: accessToken
              ? "Successfully authenticated with Twitch!"
              : "Authentication failed. Please check the console output for instructions.",
          },
        ],
      };
    }
  );

  server.tool(
    "auth-status",
    "Check authentication status with Twitch",
    {},
    async () => {
      const accessToken = getAccessToken();
      const tokenExpiresAt = getTokenExpiresAt();

      //debug
      console.error("auth-status accessToken", accessToken);
      console.error("auth-status tokenExpiresAt", tokenExpiresAt);
      const isValid = accessToken && tokenExpiresAt > Date.now();
      const expiresIn = isValid
        ? Math.floor((tokenExpiresAt - Date.now()) / 1000 / 60)
        : 0;

      return {
        content: [
          {
            type: "text",
            text: isValid
              ? `Authenticated with Twitch. Token expires in approximately ${expiresIn} minutes.`
              : "Not authenticated with Twitch.",
          },
        ],
      };
    }
  );
}
