const axios = require('axios');

class OpenRouterClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://openrouter.ai/api/v1';
    }

    async generateServerStructure(theme) {
        const prompt = `Create a Discord server structure for the theme: "${theme}".

Return a JSON object with categories, channels, and roles:
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
      "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"]
    }
  ]
}

Requirements:
- Maximum 20 channels total
- Maximum 5 voice channels
- Use emojis in channel names
- Discord-friendly names (lowercase, hyphens)
- Valid permissions: MANAGE_CHANNELS, MANAGE_ROLES, MANAGE_MESSAGES, KICK_MEMBERS, BAN_MEMBERS, SEND_MESSAGES, VIEW_CHANNEL, CONNECT, SPEAK

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
        return {
            "categories": [
                {
                    "name": "📢-welcome",
                    "channels": [
                        { "name": "👋welcome", "type": "text" },
                        { "name": "📜rules", "type": "text" },
                        { "name": "📢announcements", "type": "text" }
                    ]
                },
                {
                    "name": "💬-general",
                    "channels": [
                        { "name": "💬general-chat", "type": "text" },
                        { "name": "🎯discussion", "type": "text" },
                        { "name": "🎨showcase", "type": "text" }
                    ]
                },
                {
                    "name": "🎤-voice",
                    "channels": [
                        { "name": "🎤general-voice", "type": "voice" },
                        { "name": "🎵music-lounge", "type": "voice" }
                    ]
                }
            ],
            "roles": [
                {
                    "name": "Admin",
                    "color": "#E74C3C",
                    "permissions": ["MANAGE_MESSAGES", "KICK_MEMBERS"]
                },
                {
                    "name": "Moderator",
                    "color": "#3498DB",
                    "permissions": ["MANAGE_MESSAGES"]
                },
                {
                    "name": "Member",
                    "color": "#95A5A6",
                    "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"]
                }
            ]
        };
    }
}

module.exports = OpenRouterClient;
