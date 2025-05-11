// Token storage interface
export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Twitch API response types
export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
  email?: string;
}

export interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

export interface TwitchGame {
  id: string;
  name: string;
  box_art_url: string;
  igdb_id: string;
}

export interface UsersResponse {
  data: TwitchUser[];
}

export interface StreamsResponse {
  data: TwitchStream[];
  pagination: {
    cursor?: string;
  };
}

export interface TopGamesResponse {
  data: TwitchGame[];
  pagination: {
    cursor?: string;
  };
}

export interface ContentClassificationLabel {
  id: string;
  is_enabled: boolean;
}

export interface UpdateChannelRequest {
  game_id?: string;
  broadcaster_language?: string;
  title?: string;
  delay?: number;
  tags?: string[];
  content_classification_labels?: ContentClassificationLabel[];
  is_branded_content?: boolean;
}
