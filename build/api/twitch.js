import { TWITCH_API_BASE } from "../config/constants.js";
import { ensureValidToken } from "../auth/oauth.js";
import { getAccessToken } from "../auth/TokenManager.js";
import { getCredentials } from "../config/TwitchClient.js";
// Helper function for making Twitch API requests
export async function makeTwitchRequest(url, queryParams = {}, body = {}, method = "GET" /* HttpMethods.GET */) {
    // Ensure we have a valid token
    if (!(await ensureValidToken())) {
        throw new Error("Failed to obtain a valid access token");
    }
    const accessToken = getAccessToken();
    const { clientId } = getCredentials();
    //debug
    // console.error("makeTwitchRequest accessToken", accessToken);
    try {
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Client-Id": clientId,
            "Content-Type": "application/json",
        };
        let response;
        switch (method) {
            case "GET" /* HttpMethods.GET */:
                console.error("GET request");
                // Add query parameters
                Object.entries(queryParams).forEach(([key, value]) => {
                    url.searchParams.append(key, value);
                });
                console.error("url", url.toString());
                console.error("headers", headers);
                response = await fetch(url.toString(), {
                    method: "GET",
                    headers,
                });
                break;
            case "POST" /* HttpMethods.POST */:
                // Add body
                response = await fetch(url.toString(), {
                    method: "POST",
                    headers,
                    body: JSON.stringify(body),
                });
                break;
            case "PATCH" /* HttpMethods.PATCH */:
                response = await fetch(url.toString(), {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify(body),
                });
                break;
            case "PUT" /* HttpMethods.PUT */:
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
        //debug
        console.error("response", response);
        if (response.ok) {
            if (response.status === 204) { //No content
                return true;
            }
            return (await response.json());
        }
        return false;
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
        const result = await makeTwitchRequest(url, {}, channelInfo, "PATCH" /* HttpMethods.PATCH */);
        return result !== null && result !== false;
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
    try {
        return makeTwitchRequest(url, queryParams, {}, "GET" /* HttpMethods.GET */);
    }
    catch (error) {
        console.error("Error searching channels:", error);
        return null;
    }
}
export async function sendChatMessage(twitchChatMessage) {
    const url = new URL(`${TWITCH_API_BASE}/chat/messages`);
    try {
        const result = await makeTwitchRequest(url, {}, twitchChatMessage, "POST" /* HttpMethods.POST */);
        return result !== null && result !== false;
    }
    catch (error) {
        console.error("Error sending chat message:", error);
        return false;
    }
}
//Needs to be twitch affiliate
export async function createPoll(twitchPoll) {
    const url = new URL(`${TWITCH_API_BASE}/polls`);
    try {
        const result = await makeTwitchRequest(url, {}, twitchPoll, "POST" /* HttpMethods.POST */);
        return result !== null && result !== false;
    }
    catch (error) {
        console.error("Error creating poll:", error);
        return false;
    }
}
export async function getPoll(options) {
    const { broadcaster_id, id, first = 20, after } = options;
    const queryParams = {
        broadcaster_id,
        id,
        first: first.toString(),
        after: after || "",
    };
    const url = new URL(`${TWITCH_API_BASE}/polls`);
    return makeTwitchRequest(url, queryParams, {}, "GET" /* HttpMethods.GET */);
}
export async function endPoll(poll) {
    const url = new URL(`${TWITCH_API_BASE}/polls`);
    try {
        const result = await makeTwitchRequest(url, {}, poll, "PATCH" /* HttpMethods.PATCH */);
        return result !== null && result !== false;
    }
    catch (error) {
        console.error("Error ending poll:", error);
        return false;
    }
}
