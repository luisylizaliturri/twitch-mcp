import path from "path";
import os from "os";
import fs from "fs";


const HOME_DIR = os.homedir();
export const AUTH_PORT = 8787;

// API endpoints and URLs
export const TWITCH_API_BASE = "https://api.twitch.tv/helix";
export const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2";
export const REDIRECT_URI = `http://localhost:${AUTH_PORT}/callback`;

// File paths
const TWITCH_MCP_DIR = path.join(HOME_DIR, ".twitch_mcp");
// Create the directory if it doesn't exist
if (!fs.existsSync(TWITCH_MCP_DIR)) {
  fs.mkdirSync(TWITCH_MCP_DIR, { recursive: true });
}
export const TOKEN_FILE = path.join(TWITCH_MCP_DIR, "tokens.json");

// Authentication scopes required to access certain twitch api endpoints
export const AUTH_SCOPES = [
  "user:read:email",
  "channel:read:subscriptions",
  "user:read:follows",
  "channel:read:stream_key",
  "channel:manage:broadcast",
  "user:write:chat",
  "channel:manage:polls",
];