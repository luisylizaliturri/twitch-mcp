import path from "path";
import { fileURLToPath } from "url";

// Find the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

// Server configuration
export const AUTH_PORT = 8787;

// API endpoints and URLs
export const TWITCH_API_BASE = "https://api.twitch.tv/helix";
export const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2";
export const REDIRECT_URI = `http://localhost:${AUTH_PORT}/callback`;

// File paths
export const TOKEN_FILE = path.join(PROJECT_ROOT, "tokens.json");



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

//Twitch API credentials
//These are set by the user in the mcp config file
export let TWITCH_CLIENT_ID: string = ""; //placeholder
export let TWITCH_CLIENT_SECRET: string = ""; //placeholder

//Save user credentials for global use
export function initializeCredentials(
  clientId: string,
  clientSecret: string
): void {
  TWITCH_CLIENT_ID = clientId;
  TWITCH_CLIENT_SECRET = clientSecret;
  console.error(`TWITCH_CLIENT_ID: ${TWITCH_CLIENT_ID}`);
  console.error(`TWITCH_CLIENT_SECRET: ${TWITCH_CLIENT_SECRET}`);
}
