import fs from "fs";
import { TOKEN_FILE } from "../config/constants.js";
// Token storage
let accessToken = null;
let refreshToken = null;
let tokenExpiresAt = 0;
// Try to load saved tokens
export function loadTokens() {
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            const tokenData = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
            console.error(`Token data: ${JSON.stringify(tokenData)}`);
            console.error(`Token file ${TOKEN_FILE} exists`);
            // Check if token is still valid (with 5 min buffer)
            if (tokenData.expires_at > Date.now() + 300000) {
                accessToken = tokenData.access_token;
                refreshToken = tokenData.refresh_token;
                tokenExpiresAt = tokenData.expires_at;
                return true;
            }
            // Token exists but expired, try to refresh it
            if (tokenData.refresh_token) {
                refreshToken = tokenData.refresh_token;
                return false;
            }
        }
    }
    catch (error) {
        console.error("Error loading tokens:", error);
    }
    return false;
}
// Save tokens to file
export function saveTokens(access, refresh, expiresIn) {
    const expiresAt = Date.now() + expiresIn * 1000; // Convert seconds to milliseconds
    const tokenData = {
        access_token: access,
        refresh_token: refresh,
        expires_at: expiresAt
    };
    accessToken = access;
    refreshToken = refresh;
    tokenExpiresAt = expiresAt;
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
}
// Get the current access token
export function getAccessToken() {
    return accessToken;
}
// Get the current refresh token
export function getRefreshToken() {
    return refreshToken;
}
// Get the token expiration time
export function getTokenExpiresAt() {
    return tokenExpiresAt;
}
// Check if we have a valid token
export function hasValidToken() {
    return !!accessToken && tokenExpiresAt > Date.now() + 60000;
}
