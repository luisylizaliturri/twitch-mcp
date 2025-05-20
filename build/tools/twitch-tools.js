import { z } from "zod";
import { getCurrentUser, getStreams, getUserByLogin, getTopGames, updateChannelInfo, searchChannels, } from "../api/twitch.js";
///// Formatting functions /////
function formatUserInfo(user) {
    return [
        `Username: ${user.display_name} (${user.login})`,
        `ID: ${user.id}`,
        `Account Type: ${user.broadcaster_type || "Regular"}`,
        `Description: ${user.description || "No description"}`,
        `Total Views: ${user.view_count.toLocaleString()}`,
        `Created At: ${new Date(user.created_at).toLocaleDateString()}`,
        user.email ? `Email: ${user.email}` : "",
        `Profile Image: ${user.profile_image_url}`,
    ]
        .filter(Boolean)
        .join("\n");
}
function formatStreamInfo(stream) {
    return [
        `Channel: ${stream.user_name} (${stream.user_login})`,
        `Title: ${stream.title}`,
        `Game: ${stream.game_name}`,
        `Viewers: ${stream.viewer_count.toLocaleString()}`,
        `Started: ${new Date(stream.started_at).toLocaleString()}`,
        `Language: ${stream.language}`,
        `URL: https://twitch.tv/${stream.user_login}`,
        "---",
    ].join("\n");
}
function formatGameInfo(game) {
    return [
        `Game: ${game.name}`,
        `ID: ${game.id}`,
        `IGDB ID: ${game.igdb_id || "N/A"}`,
        `Box Art: ${game.box_art_url.replace("{width}x{height}", "285x380")}`,
        "---",
    ].join("\n");
}
function formatChannelInfo(channel) {
    return [
        `Channel: ${channel.display_name} (${channel.broadcaster_login})`,
        `ID: ${channel.broadcaster_id}`,
        `Started: ${new Date(channel.started_at).toLocaleString()}`,
        `${channel.is_live ? "Live" : "Offline"}`,
        `URL: https://twitch.tv/${channel.broadcaster_login}`,
        "---",
    ].join("\n");
}
///// Twitch tools /////
export function registerTwitchTools(server) {
    server.tool("get-current-user", "Get information about the authenticated Twitch user", {}, async () => {
        const userData = await getCurrentUser();
        if (!userData || userData.data.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to retrieve user data",
                    },
                ],
            };
        }
        const user = userData.data[0];
        const userInfo = formatUserInfo(user);
        return {
            content: [
                {
                    type: "text",
                    text: userInfo,
                },
            ],
        };
    });
    server.tool("get-user", "Get information about a Twitch user by login name", {
        login: z.string().describe("Twitch login name of the user"),
    }, async ({ login }) => {
        const userData = await getUserByLogin(login);
        if (!userData || userData.data.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No user found with login name: ${login}`,
                    },
                ],
            };
        }
        const user = userData.data[0];
        const userInfo = formatUserInfo(user);
        return {
            content: [
                {
                    type: "text",
                    text: userInfo,
                },
            ],
        };
    });
    server.tool("get-streams", "Get current live streams by game ID or user login", {
        gameId: z.string().optional().describe("Filter streams by game ID"),
        userLogin: z.string().optional().describe("Filter streams by user login"),
        limit: z
            .number()
            .min(1)
            .max(100)
            .optional()
            .describe("Number of results to return (1-100)"),
    }, async ({ gameId, userLogin, limit = 20 }) => {
        const streamsData = await getStreams({ gameId, userLogin, limit });
        if (!streamsData) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to retrieve streams data: params ${JSON.stringify({
                            gameId,
                            userLogin,
                            limit,
                        })}`,
                    },
                ],
            };
        }
        if (streamsData.data.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No streams found matching the criteria",
                    },
                ],
            };
        }
        const streamsInfo = streamsData.data.map(formatStreamInfo);
        return {
            content: [
                {
                    type: "text",
                    text: `Found ${streamsData.data.length} streams:\n\n${streamsInfo.join("\n")}`,
                },
            ],
        };
    });
    server.tool("get-top-games", "Get information about the most popular games on Twitch", {
        limit: z
            .number()
            .min(1)
            .max(100)
            .optional()
            .describe("Number of results to return (1-100)"),
        after: z
            .string()
            .optional()
            .describe("Cursor for pagination (get next page)"),
        before: z
            .string()
            .optional()
            .describe("Cursor for pagination (get previous page)"),
    }, async ({ limit = 20, after, before }) => {
        const gamesData = await getTopGames({ limit, after, before });
        if (!gamesData) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to retrieve top games data: params ${JSON.stringify({ limit, after, before })}`,
                    },
                ],
            };
        }
        if (gamesData.data.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No games found",
                    },
                ],
            };
        }
        const gamesInfo = gamesData.data.map(formatGameInfo);
        const paginationInfo = gamesData.pagination.cursor
            ? `\n\nPagination cursor: ${gamesData.pagination.cursor}`
            : "";
        return {
            content: [
                {
                    type: "text",
                    text: `Top ${gamesData.data.length} games on Twitch:\n\n${gamesInfo.join("\n")}${paginationInfo}`,
                },
            ],
        };
    });
    server.tool("update-channel", "Update a Twitch channel's information (title, game, language, etc.)", {
        broadcaster_id: z
            .string()
            .describe("The ID of the broadcaster whose channel to update"),
        game_id: z
            .string()
            .optional()
            .describe("The ID of the game to set. Use '0' or empty string to unset"),
        broadcaster_language: z
            .string()
            .optional()
            .describe("The broadcaster's language as an ISO 639-1 code (e.g. 'en')"),
        title: z.string().optional().describe("The title of the stream"),
        delay: z
            .number()
            .optional()
            .describe("Broadcast delay in seconds (Partner only, max 900)"),
        tags: z
            .array(z.string())
            .optional()
            .describe("List of tags to apply to the channel"),
        content_classification_labels: z
            .array(z.object({
            id: z.string().describe("ID of the Content Classification Label"),
            is_enabled: z
                .boolean()
                .describe("Whether the label should be enabled"),
        }))
            .optional()
            .describe("List of content classification labels to apply"),
        is_branded_content: z
            .boolean()
            .optional()
            .describe("Flag indicating if the channel has branded content"),
    }, async ({ broadcaster_id, game_id, broadcaster_language, title, delay, tags, content_classification_labels, is_branded_content, }) => {
        // Build the request object with only defined fields
        const channelInfo = {};
        if (game_id !== undefined)
            channelInfo.game_id = game_id;
        if (broadcaster_language !== undefined)
            channelInfo.broadcaster_language = broadcaster_language;
        if (title !== undefined)
            channelInfo.title = title;
        if (delay !== undefined)
            channelInfo.delay = delay;
        if (tags !== undefined)
            channelInfo.tags = tags;
        if (content_classification_labels !== undefined)
            channelInfo.content_classification_labels =
                content_classification_labels;
        if (is_branded_content !== undefined)
            channelInfo.is_branded_content = is_branded_content;
        // Ensure at least one field is being updated
        if (Object.keys(channelInfo).length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "At least one channel property must be provided to update",
                    },
                ],
            };
        }
        const success = await updateChannelInfo(broadcaster_id, channelInfo);
        if (success) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Channel information updated successfully",
                    },
                ],
            };
        }
        else {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to update channel information. Please check that you have the required permissions and all parameters are valid.",
                    },
                ],
            };
        }
    });
    server.tool("search-channels", "Search for Twitch channels by name", {
        query: z.string().describe("The search query"),
        live_only: z.boolean().describe("Filter results to live channels only"),
        first: z
            .number()
            .min(1)
            .max(100)
            .optional()
            .describe("Number of results to return (1-100)"),
        after: z
            .string()
            .optional()
            .describe("Cursor for pagination (get next page)"),
    }, async ({ query, live_only, first = 20, after }) => {
        const channelsData = await searchChannels({ query, live_only, first, after });
        if (!channelsData) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to retrieve channels data: params ${JSON.stringify({ query, live_only, first, after })}`,
                    },
                ],
            };
        }
        if (channelsData.data.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No channels found matching the criteria",
                    },
                ],
            };
        }
        const channelsInfo = channelsData.data.map(formatChannelInfo);
        const paginationInfo = channelsData.pagination.cursor
            ? `\n\nPagination cursor: ${channelsData.pagination.cursor}`
            : "";
        return {
            content: [
                {
                    type: "text",
                    text: `Found ${channelsData.data.length} channels:\n\n${channelsInfo.join("\n")}${paginationInfo}`,
                },
            ],
        };
    });
}
