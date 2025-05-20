import http from "http";
import open from "open";
import { URLSearchParams } from "url";
import { saveTokens, getRefreshToken } from "./token-manager.js";
import {
  AUTH_PORT,
  AUTH_SCOPES,
  REDIRECT_URI,
  TWITCH_AUTH_URL,
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
} from "../config/constants.js";

// Generate the authorization URL with scopes
export function generateAuthUrl(): string {
  if (!TWITCH_CLIENT_ID) {
    throw new Error(
      "TWITCH_CLIENT_ID not available. Make sure it was initialized."
    );
  }

  console.error(`generateAuthUrl: TWITCH_CLIENT_ID: ${TWITCH_CLIENT_ID}`);

  const authUrl = new URL(`${TWITCH_AUTH_URL}/authorize`);
  authUrl.searchParams.append("client_id", TWITCH_CLIENT_ID);
  authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", AUTH_SCOPES.join(" "));

  console.error(`Auth URL: ${authUrl.toString()}`);
  return authUrl.toString();
}

// Refresh the access token
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
      throw new Error(
        "Missing client credentials (ID or secret). Make sure they were initialized."
      );
    }

    const params = new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const response = await fetch(`${TWITCH_AUTH_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    saveTokens(data.access_token, data.refresh_token, data.expires_in);
    console.error("Successfully refreshed access token");
    return true;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
}

// Handle OAuth authorization flow
export async function startAuthFlow(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create HTTP server to handle OAuth callback
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || "/", `http://localhost:${AUTH_PORT}`);

      if (url.pathname === "/callback") {
        // Get the authorization code from the URL query parameters
        const code = url.searchParams.get("code");
        console.error(`Authorization code: ${code}`);

        if (code) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body>
                <h1>Authentication Successful!</h1>
                <p>You can now close this window and return to the application.</p>
                <script>window.close();</script>
              </body>
            </html>
          `);

          // Exchange code for access token
          try {
            if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
              throw new Error(
                "Missing client credentials (ID or secret). Make sure they were initialized."
              );
            }

            const params = new URLSearchParams({
              client_id: TWITCH_CLIENT_ID,
              client_secret: TWITCH_CLIENT_SECRET,
              code: code,
              grant_type: "authorization_code",
              redirect_uri: REDIRECT_URI,
            });
            console.error(`Params: ${params.toString()}`);

            const response = await fetch(`${TWITCH_AUTH_URL}/token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: params.toString(),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            saveTokens(data.access_token, data.refresh_token, data.expires_in);

            console.error("Successfully obtained access token");

            // Close the server after handling the callback
            server.close(() => {
              resolve();
            });
          } catch (error) {
            console.error("Error exchanging code for token:", error);
            reject(error);
          }
        } else {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(
            "<html><body><h1>Authentication Failed</h1><p>No authorization code received.</p></body></html>"
          );
          reject(new Error("No authorization code received"));
        }
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    // Start the server
    server.listen(AUTH_PORT, () => {
      console.error(`Authorization server listening on port ${AUTH_PORT}`);

      const authUrl = generateAuthUrl();
      // In normal environments, try to open the browser automatically
      console.error(`Opening browser to authorize application...`);
      open(authUrl).catch(() => {
        // Fallback if open fails
        console.error(
          "Could not open browser automatically. Please open this URL manually:"
        );
        console.error(authUrl);
      });
      // }
    });

    // Handle server errors
    server.on("error", (err) => {
      console.error(`Server error: ${err.message}`);
      reject(err);
    });
  });
}

// Ensure we have a valid token
export async function ensureValidToken(): Promise<boolean> {
  // If we have a valid token, return it
  if (getRefreshToken() && (await refreshAccessToken())) {
    return true;
  }

  // Start the auth flow
  try {
    await startAuthFlow();
    return true;
  } catch (error) {
    console.error("Authentication failed:", error);
    return false;
  }
}
