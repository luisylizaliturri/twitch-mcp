export function formatUserInfo(user: any): string {
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

export function formatStreamInfo(stream: any): string {
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

export function formatGameInfo(game: any): string {
  return [
    `Game: ${game.name}`,
    `ID: ${game.id}`,
    `IGDB ID: ${game.igdb_id || "N/A"}`,
    `Box Art: ${game.box_art_url.replace("{width}x{height}", "285x380")}`,
    "---",
  ].join("\n");
}

export function formatChannelInfo(channel: any): string {
  return [
    `Channel: ${channel.display_name} (${channel.broadcaster_login})`,
    `ID: ${channel.broadcaster_id}`,
    `Started: ${new Date(channel.started_at).toLocaleString()}`,
    `${channel.is_live ? "Live" : "Offline"}`,
    `URL: https://twitch.tv/${channel.broadcaster_login}`,
    "---",
  ].join("\n");
}

export function formatPollInfo(poll: any): string {
  return "";
}
