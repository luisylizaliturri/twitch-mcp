import http from "http";
import open from "open";
import { URLSearchParams } from "url";
import { saveTokens, getRefreshToken } from "./TokenManager.js";
import { AUTH_PORT, AUTH_SCOPES, REDIRECT_URI, TWITCH_AUTH_URL, } from "../config/constants.js";
import { getCredentials } from "../config/TwitchClient.js";
//Generate the authorization URL with required scopes
export function generateAuthUrl() {
    const { clientId } = getCredentials();
    if (!clientId) {
        throw new Error("TWITCH_CLIENT_ID not available. Make sure it was initialized.");
    }
    console.error(`generateAuthUrl: TWITCH_CLIENT_ID: ${clientId}`);
    const authUrl = new URL(`${TWITCH_AUTH_URL}/authorize`);
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", AUTH_SCOPES.join(" "));
    console.error(`Auth URL: ${authUrl.toString()}`);
    return authUrl.toString();
}
//Refresh access token
export async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken)
        return false;
    try {
        const { clientId, clientSecret } = getCredentials();
        if (!clientId || !clientSecret) {
            throw new Error("Missing client credentials (ID or secret). Make sure they were initialized.");
        }
        const params = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
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
    }
    catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
}
//Handle OAuth authorization flow
export async function startAuthFlow() {
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
              <head>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    background: #f7f7f8;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                  }
                  .container {
                    background: white;
                    padding: 2rem 3rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    text-align: center;
                  }
                  h1 {
                    color: #9147ff;
                    margin-bottom: 1rem;
                  }
                  p {
                    color: #53535f;
                    font-size: 1.1rem;
                    line-height: 1.5;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Twitch MCP Authentication Successful!</h1>
                  <p>You have successfully authenticated with Twitch.<br>You can now close this window and return to your application.</p>
                </div>
              </body>
            </html>
          `);
                    // Exchange code for access token
                    try {
                        const { clientId, clientSecret } = getCredentials();
                        if (!clientId || !clientSecret) {
                            throw new Error("Missing client credentials (ID or secret). Make sure they were initialized.");
                        }
                        const params = new URLSearchParams({
                            client_id: clientId,
                            client_secret: clientSecret,
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
                    }
                    catch (error) {
                        console.error("Error exchanging code for token:", error);
                        reject(error);
                    }
                }
                else {
                    res.writeHead(400, { "Content-Type": "text/html" });
                    res.end("<html><body><h1>Authentication Failed</h1><p>No authorization code received.</p></body></html>");
                    reject(new Error("No authorization code received"));
                }
            }
            else {
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
                console.error("Could not open browser automatically. Please open this URL manually:");
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
export async function ensureValidToken() {
    // check if we have a valid token
    if (getRefreshToken() && (await refreshAccessToken())) {
        return true;
    }
    //if we don't have a valid token, start the auth flow
    try {
        await startAuthFlow();
        return true;
    }
    catch (error) {
        console.error("Authentication failed:", error);
        return false;
    }
}
