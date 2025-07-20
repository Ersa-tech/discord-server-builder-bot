# 🚀 Deploy with Render (Free Alternative)

Since Railway has plan limitations, let's use **Render** - another excellent free hosting platform.

## Why Render?

- ✅ **Generous free tier** (750 hours/month)
- ✅ **Simple deployment** via GitHub
- ✅ **Automatic deployments** on git push
- ✅ **Built-in environment variables**
- ✅ **No credit card required**

## Prerequisites

1. **GitHub account** (for code hosting)
2. **Render account**: Sign up at https://render.com (free)
3. **New Discord token** (old one was exposed)

## Step 1: Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial Discord bot commit"
git branch -M main
```

Create a new repository on GitHub, then:
```bash
git remote add origin https://github.com/yourusername/discord-server-builder-bot.git
git push -u origin main
```

## Step 2: Deploy on Render

1. **Go to** https://render.com/dashboard
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub** repository
4. **Configure the service:**
   - **Name**: `discord-server-builder-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

## Step 3: Set Environment Variables

In the Render dashboard, add these environment variables:

```
DISCORD_TOKEN = [your_new_discord_token]
CLIENT_ID = 1396309838681866361
OPENROUTER_API_KEY = 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
```

## Step 4: Deploy

Click **"Create Web Service"** and Render will:
- Pull your code from GitHub
- Install dependencies
- Start your bot
- Provide deployment logs

## Alternative: Fly.io (Also Free)

If Render doesn't work, try Fly.io:

```bash
# Install Fly CLI
npm install -g @fly.io/cli

# Login
fly auth login

# Deploy
fly launch
```

## Your Bot Features

- **`/build <theme>`** - AI-powered server generation
- **`/nuke`** - Server reset (Admin only)
- **Automatic restarts** if crashes
- **GitHub auto-deployment** on code changes

## Monitoring

- **Render Dashboard**: View logs and metrics
- **Auto-redeploy** on GitHub commits
- **Free SSL** and custom domains

Your Discord Server Builder Bot will be live in minutes! 🎉
