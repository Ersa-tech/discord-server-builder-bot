const axios = require('axios');

class OpenRouterClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://openrouter.ai/api/v1';
    }

    async generateServerStructure(theme) {
        const prompt = `Create an amazing Discord server structure perfectly tailored for the theme: "${theme}".

You have complete creative freedom! Design what YOU think would be the most engaging and comprehensive server for this specific theme.

Return ONLY a valid JSON object:
{
  "categories": [
    {
      "name": "category-name",
      "channels": [
        {"name": "🎯channel-name", "type": "text"},
        {"name": "🎤voice-channel", "type": "voice"}
      ]
    }
  ],
  "roles": [
    {
      "name": "Role Name",
      "color": "#FF5733",
      "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"],
      "description": "Role purpose"
    }
  ]
}

Guidelines (use your best judgment):
- Create a MAXIMUM of 20 channels total (across all categories)
- Use relevant emojis at the start of channel names (🎵, 🎤, 📢, 💬, 🎯, 🔥, ⭐, 🎨, 📱, 🎮, etc.)
- Discord-friendly names (lowercase, hyphens for spaces)
- Create specialized channels that are unique and perfect for this specific theme
- Design a role hierarchy that makes sense for the community
- Valid permissions: MANAGE_CHANNELS, MANAGE_ROLES, MANAGE_MESSAGES, KICK_MEMBERS, BAN_MEMBERS, SEND_MESSAGES, VIEW_CHANNEL, CONNECT, SPEAK
- Make it feel like the ultimate destination for this theme's community
- Focus on quality over quantity - make each channel purposeful and engaging

Be creative! Design YOUR vision of the perfect server for this theme (max 20 channels).

Return only the JSON object.`;

        try {
            console.log('🤖 Calling OpenRouter API for theme:', theme);
            console.log('🔑 API Key present:', !!this.apiKey);
            
            const response = await axios.post(`${this.baseURL}/chat/completions`, {
                model: "anthropic/claude-3.5-sonnet",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 4000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://coinbound.io',
                    'X-Title': 'Discord Server Builder Bot'
                }
            });

            console.log('✅ OpenRouter API Response received');
            console.log('📊 Response status:', response.status);

            if (!response.data?.choices?.[0]?.message?.content) {
                console.error('❌ Invalid API response structure:', response.data);
                throw new Error('Invalid API response structure');
            }

            const content = response.data.choices[0].message.content.trim();
            console.log('📝 Raw AI response length:', content.length);
            console.log('📝 Raw AI response preview:', content.substring(0, 200) + '...');
            
            // Clean and parse JSON
            let jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
            
            console.log('🔧 Cleaned JSON length:', jsonStr.length);
            
            const parsedStructure = JSON.parse(jsonStr);
            
            if (!parsedStructure.categories || !Array.isArray(parsedStructure.categories) ||
                !parsedStructure.roles || !Array.isArray(parsedStructure.roles)) {
                console.error('❌ Invalid structure format:', parsedStructure);
                throw new Error('Invalid structure format');
            }
            
            const totalChannels = parsedStructure.categories.reduce((acc, cat) => acc + (cat.channels?.length || 0), 0);
            console.log('🎯 Generated structure:');
            console.log(`   📁 Categories: ${parsedStructure.categories.length}`);
            console.log(`   📋 Channels: ${totalChannels}`);
            console.log(`   👥 Roles: ${parsedStructure.roles.length}`);
            
            return parsedStructure;
            
        } catch (error) {
            console.error('💥 OpenRouter API Error Details:');
            console.error('   Error message:', error.message);
            console.error('   Response status:', error.response?.status);
            console.error('   Response data:', error.response?.data);
            console.log('⚠️  Falling back to default structure');
            return this.getFallbackStructure(theme);
        }
    }

    getFallbackStructure(theme) {
        const themeSlug = theme.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
        return {
            "categories": [
                {
                    "name": "📢-welcome-hub",
                    "channels": [
                        { "name": "👋welcome", "type": "text" },
                        { "name": "📜rules-and-info", "type": "text" },
                        { "name": "📢announcements", "type": "text" },
                        { "name": "🎉events", "type": "text" },
                        { "name": "🤝introductions", "type": "text" }
                    ]
                },
                {
                    "name": "💬-general-chat",
                    "channels": [
                        { "name": "💬general-chat", "type": "text" },
                        { "name": "🎮gaming-chat", "type": "text" },
                        { "name": "📱tech-talk", "type": "text" },
                        { "name": "🍕food-and-lifestyle", "type": "text" },
                        { "name": "😄memes-and-fun", "type": "text" },
                        { "name": "📰daily-discussion", "type": "text" }
                    ]
                },
                {
                    "name": `🎯-${themeSlug}`,
                    "channels": [
                        { "name": "🎯main-discussion", "type": "text" },
                        { "name": "🔥hot-topics", "type": "text" },
                        { "name": "💡ideas-and-feedback", "type": "text" },
                        { "name": "📚resources-and-guides", "type": "text" },
                        { "name": "🎨showcase", "type": "text" },
                        { "name": "❓questions-and-help", "type": "text" },
                        { "name": "📈progress-updates", "type": "text" }
                    ]
                },
                {
                    "name": "🎤-voice-channels",
                    "channels": [
                        { "name": "🎤general-voice", "type": "voice" },
                        { "name": "🎵music-lounge", "type": "voice" },
                        { "name": "🎮gaming-voice", "type": "voice" },
                        { "name": "📚study-hall", "type": "voice" },
                        { "name": "💼work-together", "type": "voice" },
                        { "name": "🎭chill-hangout", "type": "voice" }
                    ]
                },
                {
                    "name": "🎵-music-zone",
                    "channels": [
                        { "name": "🎵music-discussion", "type": "text" },
                        { "name": "🎶song-recommendations", "type": "text" },
                        { "name": "🎧listening-party", "type": "voice" },
                        { "name": "🎤karaoke-night", "type": "voice" },
                        { "name": "🎼music-production", "type": "text" }
                    ]
                },
                {
                    "name": "🎮-gaming-hub",
                    "channels": [
                        { "name": "🎮game-chat", "type": "text" },
                        { "name": "🏆tournaments", "type": "text" },
                        { "name": "🎯team-finder", "type": "text" },
                        { "name": "🎮gaming-voice-1", "type": "voice" },
                        { "name": "🎮gaming-voice-2", "type": "voice" },
                        { "name": "🎮gaming-voice-3", "type": "voice" }
                    ]
                },
                {
                    "name": "🎨-creative-corner",
                    "channels": [
                        { "name": "🎨art-showcase", "type": "text" },
                        { "name": "📸photography", "type": "text" },
                        { "name": "✍️writing-corner", "type": "text" },
                        { "name": "🎬video-content", "type": "text" },
                        { "name": "🎨creative-voice", "type": "voice" }
                    ]
                },
                {
                    "name": "🏆-community",
                    "channels": [
                        { "name": "🏆achievements", "type": "text" },
                        { "name": "🎊celebrations", "type": "text" },
                        { "name": "📝feedback", "type": "text" },
                        { "name": "🤝partnerships", "type": "text" },
                        { "name": "📊polls-and-votes", "type": "text" }
                    ]
                }
            ],
            "roles": [
                {
                    "name": "👑 Owner",
                    "color": "#FFD700",
                    "permissions": ["MANAGE_CHANNELS", "MANAGE_ROLES", "KICK_MEMBERS", "BAN_MEMBERS", "MANAGE_MESSAGES"],
                    "description": "Server owner"
                },
                {
                    "name": "🛡️ Admin",
                    "color": "#E74C3C",
                    "permissions": ["MANAGE_CHANNELS", "MANAGE_ROLES", "KICK_MEMBERS", "BAN_MEMBERS", "MANAGE_MESSAGES"],
                    "description": "Server administrator"
                },
                {
                    "name": "⚔️ Moderator",
                    "color": "#3498DB",
                    "permissions": ["MANAGE_MESSAGES", "KICK_MEMBERS"],
                    "description": "Server moderator"
                },
                {
                    "name": "🌟 VIP",
                    "color": "#9B59B6",
                    "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"],
                    "description": "VIP member"
                },
                {
                    "name": "🔥 Active Member",
                    "color": "#E67E22",
                    "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"],
                    "description": "Very active community member"
                },
                {
                    "name": "💎 Supporter",
                    "color": "#1ABC9C",
                    "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"],
                    "description": "Community supporter"
                },
                {
                    "name": "🎵 Music Lover",
                    "color": "#FF69B4",
                    "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL", "CONNECT", "SPEAK"],
                    "description": "Music enthusiast"
                },
                {
                    "name": "🎮 Gamer",
                    "color": "#00FF00",
                    "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL", "CONNECT", "SPEAK"],
                    "description": "Gaming community member"
                },
                {
                    "name": "🎨 Creator",
                    "color": "#FF1493",
                    "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"],
                    "description": "Content creator"
                },
                {
                    "name": "👥 Member",
                    "color": "#95A5A6",
                    "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"],
                    "description": "Regular server member"
                },
                {
                    "name": "🆕 Newcomer",
                    "color": "#BDC3C7",
                    "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"],
                    "description": "New to the community"
                }
            ]
        };
    }
}

module.exports = OpenRouterClient;
