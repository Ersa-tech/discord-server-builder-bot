const axios = require('axios');

class OpenRouterClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://openrouter.ai/api/v1';
    }

    async generateServerStructure(theme) {
        const models = [
            "meta-llama/llama-3.1-405b-instruct",
            "anthropic/claude-3.5-sonnet", 
            "openai/gpt-4o",
            "google/gemini-pro-1.5"
        ];

        const prompt = `Design a creative Discord server for: "${theme}"

Create categories, channels, and roles that perfectly match this theme. Be imaginative and specific to the theme.

JSON format:
{
  "categories": [
    {
      "name": "category-name", 
      "channels": [
        {"name": "🎯channel-name", "type": "text"},
        {"name": "🎤voice-name", "type": "voice"}
      ]
    }
  ],
  "roles": [
    {
      "name": "Role Name",
      "color": "#hex",
      "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"]
    }
  ]
}

Limits: 20 channels max, 5 voice max. Use emojis. Make it themed and unique!`;

        for (const model of models) {
            try {
                console.log(`🤖 Trying ${model} for theme:`, theme);
                
                const response = await axios.post(`${this.baseURL}/chat/completions`, {
                    model: model,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.85,
                    max_tokens: 3000
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://coinbound.io',
                        'X-Title': 'Discord Server Builder Bot'
                    }
                });

                if (!response.data?.choices?.[0]?.message?.content) {
                    throw new Error('Invalid API response structure');
                }

                const content = response.data.choices[0].message.content.trim();
                console.log(`✅ ${model} responded with ${content.length} chars`);
                
                // Clean and parse JSON
                let jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
                const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[0];
                }
                
                const parsedStructure = JSON.parse(jsonStr);
                
                // Validate structure
                if (!parsedStructure.categories || !Array.isArray(parsedStructure.categories) ||
                    !parsedStructure.roles || !Array.isArray(parsedStructure.roles)) {
                    throw new Error('Invalid structure format');
                }
                
                // Enforce limits
                let totalChannels = 0;
                let voiceChannels = 0;
                
                for (const category of parsedStructure.categories) {
                    if (category.channels) {
                        totalChannels += category.channels.length;
                        voiceChannels += category.channels.filter(ch => ch.type === 'voice').length;
                    }
                }
                
                if (totalChannels > 20) {
                    // Trim channels to fit limit
                    let channelsToRemove = totalChannels - 20;
                    for (const category of parsedStructure.categories) {
                        if (channelsToRemove <= 0) break;
                        const toRemove = Math.min(channelsToRemove, category.channels.length - 1);
                        category.channels.splice(-toRemove);
                        channelsToRemove -= toRemove;
                    }
                }
                
                if (voiceChannels > 5) {
                    // Trim voice channels
                    let voiceToRemove = voiceChannels - 5;
                    for (const category of parsedStructure.categories) {
                        if (voiceToRemove <= 0) break;
                        for (let i = category.channels.length - 1; i >= 0 && voiceToRemove > 0; i--) {
                            if (category.channels[i].type === 'voice') {
                                category.channels.splice(i, 1);
                                voiceToRemove--;
                            }
                        }
                    }
                }
                
                console.log(`🎯 ${model} generated valid structure:`, 
                    `${parsedStructure.categories.length} categories,`, 
                    `${parsedStructure.categories.reduce((acc, cat) => acc + cat.channels.length, 0)} channels,`,
                    `${parsedStructure.roles.length} roles`);
                
                return parsedStructure;
                
            } catch (error) {
                console.error(`❌ ${model} failed:`, error.message);
                continue;
            }
        }
        
        console.log('⚠️ All models failed, using fallback');
        return this.getFallbackStructure(theme);
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
