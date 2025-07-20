const axios = require('axios');

class OpenRouterClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://openrouter.ai/api/v1';
    }

    async generateServerStructure(theme) {
        const prompt = `You are a Discord server architect. Create a HIGHLY SPECIFIC Discord server structure EXCLUSIVELY for: "${theme}".

DO NOT create a generic server. Every category, channel, and role must be 100% tailored to this exact theme.

Examples of theme-specific customization:
- For "SoundCloud rappers": Categories like "🎤 Studio Sessions", "💰 Business & Deals", "🔥 Beat Battles"
- For "PS4 gaming": Categories like "🎮 Game Lobbies", "🏆 Tournament Central", "🎯 LFG by Game"
- For "anime fans": Categories like "📺 Current Season", "💬 Waifu Wars", "🎨 Fan Art Gallery"

Return ONLY a valid JSON object:
{
  "categories": [
    {
      "name": "theme-specific-category",
      "channels": [
        {"name": "🎯theme-specific-channel", "type": "text"},
        {"name": "🎤theme-specific-voice", "type": "voice"}
      ]
    }
  ],
  "roles": [
    {
      "name": "Theme Specific Role",
      "color": "#FF5733",
      "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"],
      "description": "Role purpose for this theme"
    }
  ]
}

CRITICAL REQUIREMENTS:
- MAXIMUM 20 channels total
- Every single category name must reflect the specific theme "${theme}"
- Every single channel name must be theme-specific (no generic "general-chat")
- Use relevant emojis that match the theme exactly
- Role names must be theme-appropriate (no generic "Member", "Moderator")
- Discord-friendly names (lowercase, hyphens for spaces)
- Valid permissions: MANAGE_CHANNELS, MANAGE_ROLES, MANAGE_MESSAGES, KICK_MEMBERS, BAN_MEMBERS, SEND_MESSAGES, VIEW_CHANNEL, CONNECT, SPEAK

Think about what someone passionate about "${theme}" would want in their perfect Discord server. Make it 100% theme-specific!

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
        console.log('🚨 Using fallback structure - AI call failed for theme:', theme);
        
        const themeSlug = theme.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
        const themeLower = theme.toLowerCase();
        
        // Try to make fallback somewhat theme-aware
        let emoji = '🎯';
        let rolePrefix = '';
        
        if (themeLower.includes('gaming') || themeLower.includes('ps4') || themeLower.includes('xbox') || themeLower.includes('game')) {
            emoji = '🎮';
            rolePrefix = 'Gaming';
        } else if (themeLower.includes('music') || themeLower.includes('rapper') || themeLower.includes('soundcloud') || themeLower.includes('beat')) {
            emoji = '🎵';
            rolePrefix = 'Music';
        } else if (themeLower.includes('anime') || themeLower.includes('manga') || themeLower.includes('otaku')) {
            emoji = '📺';
            rolePrefix = 'Anime';
        } else if (themeLower.includes('art') || themeLower.includes('design') || themeLower.includes('creative')) {
            emoji = '🎨';
            rolePrefix = 'Creative';
        } else if (themeLower.includes('crypto') || themeLower.includes('trading') || themeLower.includes('nft')) {
            emoji = '💰';
            rolePrefix = 'Trader';
        }
        
        return {
            "categories": [
                {
                    "name": "📢-info-center",
                    "channels": [
                        { "name": "👋welcome", "type": "text" },
                        { "name": "📜server-rules", "type": "text" },
                        { "name": "📢announcements", "type": "text" }
                    ]
                },
                {
                    "name": `${emoji}-${themeSlug}-main`,
                    "channels": [
                        { "name": `${emoji}${themeSlug}-chat`, "type": "text" },
                        { "name": `🔥${themeSlug}-discussions`, "type": "text" },
                        { "name": `🎯${themeSlug}-showcase`, "type": "text" },
                        { "name": `❓${themeSlug}-help`, "type": "text" }
                    ]
                },
                {
                    "name": `${emoji}-${themeSlug}-voice`,
                    "channels": [
                        { "name": `${emoji}${themeSlug}-hangout`, "type": "voice" },
                        { "name": `🎤${themeSlug}-discussion`, "type": "voice" },
                        { "name": `💬casual-voice`, "type": "voice" }
                    ]
                }
            ],
            "roles": [
                {
                    "name": `${emoji} ${rolePrefix} Expert`,
                    "color": "#E74C3C",
                    "permissions": ["MANAGE_MESSAGES", "KICK_MEMBERS"],
                    "description": `Expert in ${theme}`
                },
                {
                    "name": `🌟 ${rolePrefix} Enthusiast`,
                    "color": "#9B59B6",
                    "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"],
                    "description": `Active ${theme} enthusiast`
                },
                {
                    "name": `${emoji} ${rolePrefix} Member`,
                    "color": "#95A5A6",
                    "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"],
                    "description": `Member interested in ${theme}`
                }
            ]
        };
    }
}

module.exports = OpenRouterClient;
