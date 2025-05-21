import { TWITCH_API_BASE } from "../config/constants.js";
import {
  UsersResponse,
  StreamsResponse,
  TopGamesResponse,
  UpdateChannelRequest,
  SearchChannelsResponse,
  SendChatMessageResponse,
} from "../types/index.js";
import { ensureValidToken } from "../auth/oauth.js";
import { getAccessToken } from "../auth/token-manager.js";

// Client credentials from command line arguments
const clientId = process.argv[2];

const enum HttpMethods {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  PUT = "PUT",
  DELETE = "DELETE",
}

// Helper function for making Twitch API requests
export async function makeTwitchRequest<T>(
  url: URL,
  queryParams: Record<string, string> = {},
  body: Record<string, any> = {},
  method: HttpMethods = HttpMethods.GET
): Promise<T | null> {
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

    let response: Response;

    switch (method) {
      case HttpMethods.GET:
        // Add query parameters
        Object.entries(queryParams).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });

        response = await fetch(url.toString(), {
          method: "GET",
          headers,
        });
        break;
      case HttpMethods.POST:
        // Add body
        url.searchParams.append("body", JSON.stringify(body));
        response = await fetch(url.toString(), {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        break;
      case HttpMethods.PATCH:
        url.searchParams.append("body", JSON.stringify(body));
        response = await fetch(url.toString(), {
          method: "PATCH",
          headers,
          body: JSON.stringify(body),
        });
        break;
      case HttpMethods.PUT:
        url.searchParams.append("body", JSON.stringify(body));
        response = await fetch(url.toString(), {
          method: "PUT",
          headers,
          body: JSON.stringify(body),
        });
        break;
      case HttpMethods.DELETE:
        response = await fetch(url.toString(), {
          method: "DELETE",
          headers,
        });
        break;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making Twitch request:", error);
    return null;
  }
}

//// API methods for Twitch endpoints ////

export async function getCurrentUser(): Promise<UsersResponse | null> {
  const url = new URL(`${TWITCH_API_BASE}/users`);
  return makeTwitchRequest<UsersResponse>(url, {}, {}, HttpMethods.GET);
}

export async function getUserByLogin(
  login: string
): Promise<UsersResponse | null> {
  const url = new URL(`${TWITCH_API_BASE}/users`);
  url.searchParams.append("login", login);
  return makeTwitchRequest<UsersResponse>(url, {}, {}, HttpMethods.GET);
}

export async function getStreams(options: {
  gameId?: string;
  userLogin?: string;
  limit?: number;
}): Promise<StreamsResponse | null> {
  const { gameId, userLogin, limit = 20 } = options;
  const queryParams: Record<string, string> = {
    first: limit.toString(),
  };

  if (gameId) {
    queryParams.game_id = gameId;
  }

  if (userLogin) {
    queryParams.user_login = userLogin;
  }

  const url = new URL(`${TWITCH_API_BASE}/streams`);

  return makeTwitchRequest<StreamsResponse>(
    url,
    queryParams,
    {},
    HttpMethods.GET
  );
}

export async function getTopGames(
  options: {
    limit?: number;
    after?: string;
    before?: string;
  } = {}
): Promise<TopGamesResponse | null> {
  const { limit = 20, after, before } = options;
  const queryParams: Record<string, string> = {
    first: limit.toString(),
  };

  if (after) {
    queryParams.after = after;
  }

  if (before) {
    queryParams.before = before;
  }

  const url = new URL(`${TWITCH_API_BASE}/games/top`);

  return makeTwitchRequest<TopGamesResponse>(
    url,
    queryParams,
    {},
    HttpMethods.GET
  );
}

export async function updateChannelInfo(
  broadcasterId: string,
  channelInfo: UpdateChannelRequest
): Promise<boolean> {
  const url = new URL(`${TWITCH_API_BASE}/channels`);

  url.searchParams.append("broadcaster_id", broadcasterId);

  try {
    return (
      makeTwitchRequest<UpdateChannelRequest>(
        url,
        {},
        channelInfo,
        HttpMethods.PATCH
      ) !== null
    );
  } catch (error) {
    console.error("Error updating channel information:", error);
    return false;
  }
}

export async function searchChannels(options: {
  query: string;
  live_only: boolean;
  first: number;
  after?: string;
}): Promise<SearchChannelsResponse | null> {
  const { query, live_only, first = 20, after } = options;
  const queryParams: Record<string, string> = {
    query,
    live_only: live_only.toString(),
    first: first.toString(),
    after: after || "",
  };

  const url = new URL(`${TWITCH_API_BASE}/search/channels`);

  return makeTwitchRequest<SearchChannelsResponse>(
    url,
    queryParams,
    {},
    HttpMethods.GET
  );
}

export async function sendChatMessage(options: {
  broadcaster_id: string;
  sender_id: string;
  message: string;
  reply_parent_message_id?: string;
}): Promise<boolean> {
  // Ensure we have a valid token
  if (!(await ensureValidToken())) {
    throw new Error("Failed to obtain a valid access token");
  }

  const url = new URL(`${TWITCH_API_BASE}/chat/messages`);

  const { broadcaster_id, sender_id, message, reply_parent_message_id } =
    options;

  url.searchParams.append("broadcaster_id", broadcaster_id);
  url.searchParams.append("sender_id", sender_id);
  url.searchParams.append("message", message);

  if (reply_parent_message_id) {
    url.searchParams.append("reply_parent_message_id", reply_parent_message_id);
  }

  try {
    return (
      makeTwitchRequest<SendChatMessageResponse>(
        url,
        {},
        {},
        HttpMethods.POST
      ) !== null
    );
  } catch (error) {
    console.error("Error sending chat message:", error);
    return false;
  }
}
