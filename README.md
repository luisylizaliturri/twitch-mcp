# The Unofficial Twitch MCP

This MCP server allows AI agents to interact with the Twitch streaming platform. Streamers and moderators can increase their productivity by using AI agents to manage their streams through text or voice commands.

## Features
- Stream management through AI agents
- Chat interaction capabilities
- Poll management (for Partners/Affiliates)
- Channel information updates
- Real-time stream analytics
- (more feautres are being rolled out!)

## Setup Instructions

### 1. Twitch Application Registration
1. Visit the [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Click "Register Your Application"
3. Fill in the following details:
   - **Name**: Choose a unique name for your application
   - **OAuth Redirect URLs**: `http://localhost:8787/callback`
   - **Category**: Select an appropriate category
4. After registration, save your:
   - Client ID
   - Client Secret

### 2. Configuration
Add the following to your MCP client's configuration file

The configuration files can typically be found in the following locations:

| Application     | Configuration Path |
|----------------|-------------------|
| Cursor         | `~/.cursor/mcp.json` |
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` |



Using Github:

```json
{
  "mcpServers": {
      "twitch_mcp": {
            "command": "npx",
            "args": [
                  "-y",
                  "github:luisylizaliturri/twitch-mcp#main",
                  "--client-id",
                  "XXX",
                  "--client-secret",
                  "YYY"
                  ]
         }
  }
}
```


Using NPM package:

```json
{
  "mcpServers": {
      "twitch_mcp": {
            "command": "npx",
            "args": [
                  "-y",
                  "@mcp-addons/twitch-mcp@latest",
                  "--client-id",
                  "XXX",
                  "--client-secret",
                  "YYY"
                  ]
         }
  }
}
```



**Note**: Restart your MCP client application after updating the configuration.

## First-Time Usage
1. Open your mcp client application of choice.
2. A browser window will open automatically
3. Authorize access to your Twitch account
4. You're ready to use the MCP server!

## Available Tools

### Authentication
- `authenticate` - Initiate Twitch authentication
- `auth-status` - Check current authentication status

### User Information
- `get-current-user` - Get authenticated user details
- `get-user` - Get information about any Twitch user
- `get-streams` - Get information about live streams
- `get-top-games` - Get current top games on Twitch

### Channel Management
- `update-channel` - Update channel information
- `search-channels` - Search for Twitch channels
- `send-chat-message` - Send messages in chat

### Interactive Features
- `create-poll` - Create a new poll*
- `get-poll` - Get poll information*
- `end-poll` - End an active poll*

\* *Some of these features require Twitch Partner or Affiliate status*

## Additional Resources
- [Twitch Partner Program](https://www.twitch.tv/p/en/partners/)
- [Twitch Affiliate Program](https://help.twitch.tv/s/article/joining-the-affiliate-program?language=en_US)

## Support
For issues or questions, please open an issue in the repository.