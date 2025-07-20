const axios = require('axios');

class OpenRouterClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://openrouter.ai/api/v1';
    }

    async generateServerStructure(theme) {
        const prompt = `Create a Discord server structure for the theme: "${theme}".

Return ONLY a valid JSON object:
{
  "categories": [
    {
      "name": "category-name",
      "channels": [
        {"name": "channel-name", "type": "text"},
        {"name": "voice-channel", "type": "voice"}
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

Requirements:
- 3-5 categories maximum
- 15-25 channels total (mix of text and voice)
- 5-10 roles with appropriate permissions
- Discord-friendly names (lowercase, hyphens for spaces)
- Valid permissions: MANAGE_CHANNELS, MANAGE_ROLES, MANAGE_MESSAGES, KICK_MEMBERS, BAN_MEMBERS, SEND_MESSAGES, VIEW_CHANNEL, CONNECT, SPEAK

Return only the JSON object.`;

        try {
            const response = await axios.post(`${this.baseURL}/chat/completions`, {
                model: "anthropic/claude-3.5-sonnet",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 2500
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://coinbound.io',
                    'X-Title': 'Discord Server Builder Bot'
                }
            });

            if (!response.data?.choices?.[0]?.message?.content) {
                throw new Error('Invalid API response');
            }

            const content = response.data.choices[0].message.content.trim();
            
            // Clean and parse JSON
            let jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
            
            const parsedStructure = JSON.parse(jsonStr);
            
            if (!parsedStructure.categories || !Array.isArray(parsedStructure.categories) ||
                !parsedStructure.roles || !Array.isArray(parsedStructure.roles)) {
                throw new Error('Invalid structure format');
            }
            
            return parsedStructure;
            
        } catch (error) {
            console.error('OpenRouter API Error:', error.message);
            return this.getFallbackStructure(theme);
        }
    }

    getFallbackStructure(theme) {
        return {
            "categories": [
                {
                    "name": "welcome-and-info",
                    "channels": [
                        { "name": "welcome", "type": "text" },
                        { "name": "rules", "type": "text" },
                        { "name": "announcements", "type": "text" }
                    ]
                },
                {
                    "name": "general-discussion",
                    "channels": [
                        { "name": "general-chat", "type": "text" },
                        { "name": "general-voice", "type": "voice" },
                        { "name": "music-lounge", "type": "voice" }
                    ]
                },
                {
                    "name": theme.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'),
                    "channels": [
                        { "name": "topic-discussion", "type": "text" },
                        { "name": "topic-voice", "type": "voice" },
                        { "name": "resources", "type": "text" }
                    ]
                }
            ],
            "roles": [
                {
                    "name": "Member",
                    "color": "#95A5A6",
                    "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"],
                    "description": "Regular server member"
                },
                {
                    "name": "Moderator",
                    "color": "#3498DB",
                    "permissions": ["MANAGE_MESSAGES", "KICK_MEMBERS"],
                    "description": "Server moderator"
                },
                {
                    "name": "Admin",
                    "color": "#E74C3C",
                    "permissions": ["MANAGE_CHANNELS", "MANAGE_ROLES", "KICK_MEMBERS", "BAN_MEMBERS"],
                    "description": "Server administrator"
                }
            ]
        };
    }
}

module.exports = OpenRouterClient;
