# Discord Server Builder Bot

A professional Discord bot that automatically creates themed server structures using AI, powered by OpenRouter and built by Coinbound.

## Features

- **AI-Powered Server Building**: Generate complete Discord server structures based on themes
- **Smart Permissions**: Automatically handles permission validation and bot limitations  
- **Server Reset**: Nuclear option to reset servers to basic configuration
- **Professional Interface**: Clean, modern web interface for bot information
- **Error Handling**: Robust error handling with graceful fallbacks

## Commands

- `/build <theme>` - Generate and create a themed server structure
- `/nuke` - Reset server to basic configuration (Admin only)

## Requirements

- Node.js 18+
- Discord Bot Token
- OpenRouter API Key
- Administrator permissions in Discord server

## Quick Setup

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd Discord Bot/bot
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your tokens
   ```

3. **Start Bot**
   ```bash
   npm start
   ```

## Environment Variables

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Deployment

The website can be deployed to Netlify using the included `netlify.toml` configuration.

## Built By

**Coinbound** - Professional Discord automation solutions

---

*This bot requires proper Discord permissions to function. Ensure the bot has Administrator or appropriate channel/role management permissions.*
