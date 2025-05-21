import { TWITCH_API_BASE } from "../config/constants.js";
import { ensureValidToken } from "../auth/oauth.js";
import { getAccessToken } from "../auth/token-manager.js";
// Client credentials from command line arguments
const clientId = process.argv[2];
// Helper function for making Twitch API requests
export async function makeTwitchRequest(url, queryParams = {}, body = {}, method = "GET" /* HttpMethods.GET */) {
    // Ensure we have a valid token
    if (!(await ensureValidToken())) {
        throw new Error("Failed to obtain a valid access token");
    }
    const accessToken = getAccessToken();
    try {
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Client-Id": clientId,
            "Content-Type": "application/json",
        };
        let response;
        switch (method) {
            case "GET" /* HttpMethods.GET */:
                // Add query parameters
                Object.entries(queryParams).forEach(([key, value]) => {
                    url.searchParams.append(key, value);
                });
                response = await fetch(url.toString(), {
                    method: "GET",
                    headers,
                });
                break;
            case "POST" /* HttpMethods.POST */:
                // Add body
                url.searchParams.append("body", JSON.stringify(body));
                response = await fetch(url.toString(), {
                    method: "POST",
                    headers,
                    body: JSON.stringify(body),
                });
                break;
            case "PATCH" /* HttpMethods.PATCH */:
                url.searchParams.append("body", JSON.stringify(body));
                response = await fetch(url.toString(), {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify(body),
                });
                break;
            case "PUT" /* HttpMethods.PUT */:
                url.searchParams.append("body", JSON.stringify(body));
                response = await fetch(url.toString(), {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(body),
                });
                break;
            case "DELETE" /* HttpMethods.DELETE */:
                response = await fetch(url.toString(), {
                    method: "DELETE",
                    headers,
                });
                break;
        }
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
//// API methods for Twitch endpoints ////
export async function getCurrentUser() {
    const url = new URL(`${TWITCH_API_BASE}/users`);
    return makeTwitchRequest(url, {}, {}, "GET" /* HttpMethods.GET */);
}
export async function getUserByLogin(login) {
    const url = new URL(`${TWITCH_API_BASE}/users`);
    url.searchParams.append("login", login);
    return makeTwitchRequest(url, {}, {}, "GET" /* HttpMethods.GET */);
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
    const url = new URL(`${TWITCH_API_BASE}/streams`);
    return makeTwitchRequest(url, queryParams, {}, "GET" /* HttpMethods.GET */);
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
    const url = new URL(`${TWITCH_API_BASE}/games/top`);
    return makeTwitchRequest(url, queryParams, {}, "GET" /* HttpMethods.GET */);
}
export async function updateChannelInfo(broadcasterId, channelInfo) {
    const url = new URL(`${TWITCH_API_BASE}/channels`);
    url.searchParams.append("broadcaster_id", broadcasterId);
    try {
        return (makeTwitchRequest(url, {}, channelInfo, "PATCH" /* HttpMethods.PATCH */) !== null);
    }
    catch (error) {
        console.error("Error updating channel information:", error);
        return false;
    }
}
export async function searchChannels(options) {
    const { query, live_only, first = 20, after } = options;
    const queryParams = {
        query,
        live_only: live_only.toString(),
        first: first.toString(),
        after: after || "",
    };
    const url = new URL(`${TWITCH_API_BASE}/search/channels`);
    return makeTwitchRequest(url, queryParams, {}, "GET" /* HttpMethods.GET */);
}
export async function sendChatMessage(options) {
    // Ensure we have a valid token
    if (!(await ensureValidToken())) {
        throw new Error("Failed to obtain a valid access token");
    }
    const url = new URL(`${TWITCH_API_BASE}/chat/messages`);
    const { broadcaster_id, sender_id, message, reply_parent_message_id } = options;
    url.searchParams.append("broadcaster_id", broadcaster_id);
    url.searchParams.append("sender_id", sender_id);
    url.searchParams.append("message", message);
    if (reply_parent_message_id) {
        url.searchParams.append("reply_parent_message_id", reply_parent_message_id);
    }
    try {
        return (makeTwitchRequest(url, {}, {}, "POST" /* HttpMethods.POST */) !== null);
    }
    catch (error) {
        console.error("Error sending chat message:", error);
        return false;
    }
}
