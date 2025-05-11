# Twitch MCP Integration

This MCP integration allows Claude to interact with the Twitch API.

## Setup

1. Register your application at [Twitch Developer Console](https://dev.twitch.tv/console/apps) with these settings:
   - Name: Choose a unique name for your application
   - OAuth Redirect URLs: `http://localhost:3000/callback`
   - Category: Choose any appropriate category

2. After registration, copy your Client ID and generate a Client Secret.

## Running the Application

Run the application with your Client ID and Secret as command-line arguments:

```bash
node dist/index.js <your_client_id> <your_client_secret>
```

The first time you run the app, it will open your browser to authorize access to your Twitch account.

## Available Tools

- `authenticate`: Manually trigger Twitch authentication
- `auth-status`: Check authentication status with Twitch
- More tools to view and manage Twitch resources 