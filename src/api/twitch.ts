import { TWITCH_API_BASE } from "../config/constants.js";
import {
  UsersResponse,
  StreamsResponse,
  TopGamesResponse,
  UpdateChannelRequest,
  SearchChannelsResponse,
  TwitchPoll,
  TwitchChatMessage,
  GetPollResponse,
} from "../types/index.js";
import { ensureValidToken } from "../auth/oauth.js";
import { getAccessToken } from "../auth/TokenManager.js";
import { getCredentials } from "../config/TwitchClient.js";

// Client credentials from command line arguments
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
  const { clientId } = getCredentials();
  //debug
  // console.error("makeTwitchRequest accessToken", accessToken);

  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": clientId,
      "Content-Type": "application/json",
    };

    let response: Response;

    switch (method) {
      case HttpMethods.GET:
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
      case HttpMethods.POST:
        // Add body
        response = await fetch(url.toString(), {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        break;
      case HttpMethods.PATCH:
        response = await fetch(url.toString(), {
          method: "PATCH",
          headers,
          body: JSON.stringify(body),
        });
        break;
      case HttpMethods.PUT:
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

    console.error("response", response);

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return false as T;
    }

    if (response.status === 400) {
      console.error("Bad Request");
      return false as T;
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
    const result = await makeTwitchRequest<boolean>(
      url,
      {},
      channelInfo,
      HttpMethods.PATCH
    );
    return result === null ? false : result;
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

  try {
    return makeTwitchRequest<SearchChannelsResponse>(
      url,
      queryParams,
      {},
      HttpMethods.GET
    );
  } catch (error) {
    console.error("Error searching channels:", error);
    return null;
  }
}

export async function sendChatMessage(
  twitchChatMessage: TwitchChatMessage
): Promise<boolean> {
  const url = new URL(`${TWITCH_API_BASE}/chat/messages`);

  try {
    const result = await makeTwitchRequest<boolean>(
      url,
      {},
      twitchChatMessage,
      HttpMethods.POST
    );
    return result === null ? false : result;
  } catch (error) {
    console.error("Error sending chat message:", error);
    return false;
  }
}

//Needs to be twitch affiliate
export async function createPoll(twitchPoll: TwitchPoll): Promise<boolean> {
  const url = new URL(`${TWITCH_API_BASE}/polls`);

  try {
    const result = await makeTwitchRequest<boolean>(
      url,
      {},
      twitchPoll,
      HttpMethods.POST
    );
    return result === null ? false : result;
  } catch (error) {
    console.error("Error creating poll:", error);
    return false;
  }
}

export async function getPoll(options: {
  broadcaster_id: string;
  id: string;
  first: number;
  after?: string;
}): Promise<GetPollResponse | null> {
  const { broadcaster_id, id, first = 20, after } = options;
  const queryParams: Record<string, string> = {
    broadcaster_id,
    id,
    first: first.toString(),
    after: after || "",
  };

  const url = new URL(`${TWITCH_API_BASE}/polls`);
  return makeTwitchRequest<GetPollResponse>(
    url,
    queryParams,
    {},
    HttpMethods.GET
  );
}

export async function endPoll(poll: {
  broadcaster_id: string;
  id: string;
  status: string;
}): Promise<boolean> {
  const url = new URL(`${TWITCH_API_BASE}/polls`);

  try {
    const result = await makeTwitchRequest<boolean>(
      url,
      {},
      poll,
      HttpMethods.PATCH
    );
    return result === null ? false : result;
  } catch (error) {
    console.error("Error ending poll:", error);
    return false;
  }
}
