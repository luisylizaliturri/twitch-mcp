import { TWITCH_API_BASE } from "../config/constants.js";
import { ensureValidToken } from "../auth/oauth.js";
import { getAccessToken } from "../auth/token-manager.js";
// Client credentials from command line arguments
const clientId = process.argv[2];
// Helper function for making Twitch API requests
export async function makeTwitchRequest(endpoint, queryParams = {}) {
    // Ensure we have a valid token
    if (!await ensureValidToken()) {
        throw new Error("Failed to obtain a valid access token");
    }
    const accessToken = getAccessToken();
    const url = new URL(`${TWITCH_API_BASE}/${endpoint}`);
    // Add query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Client-Id": clientId,
        "Content-Type": "application/json"
    };
    try {
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json());
    }
    catch (error) {
        console.error("Error making Twitch request:", error);
        return null;
    }
}
// API methods for Twitch endpoints
export async function getCurrentUser() {
    return makeTwitchRequest("users");
}
export async function getUserByLogin(login) {
    return makeTwitchRequest("users", { login });
}
export async function getStreams(options) {
    const { gameId, userLogin, limit = 20 } = options;
    const queryParams = {
        first: limit.toString(),
    };
    if (gameId) {
        queryParams.game_id = gameId;
    }
    if (userLogin) {
        queryParams.user_login = userLogin;
    }
    return makeTwitchRequest("streams", queryParams);
}
export async function getTopGames(options = {}) {
    const { limit = 20, after, before } = options;
    const queryParams = {
        first: limit.toString(),
    };
    if (after) {
        queryParams.after = after;
    }
    if (before) {
        queryParams.before = before;
    }
    return makeTwitchRequest("games/top", queryParams);
}
export async function updateChannelInfo(broadcasterId, channelInfo) {
    // Ensure we have a valid token
    if (!await ensureValidToken()) {
        throw new Error("Failed to obtain a valid access token");
    }
    const accessToken = getAccessToken();
    const url = new URL(`${TWITCH_API_BASE}/channels`);
    url.searchParams.append("broadcaster_id", broadcasterId);
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Client-Id": clientId,
        "Content-Type": "application/json"
    };
    try {
        const response = await fetch(url.toString(), {
            method: "PATCH",
            headers,
            body: JSON.stringify(channelInfo)
        });
        // Success response is 204 No Content
        return response.status === 204;
    }
    catch (error) {
        console.error("Error updating channel information:", error);
        return false;
    }
}
