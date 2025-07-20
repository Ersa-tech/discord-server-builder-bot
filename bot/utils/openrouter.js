const axios = require('axios');

class OpenRouterClient {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.OPENROUTER_API_KEY;
        this.baseURL = 'https://openrouter.ai/api/v1';
        
        if (!this.apiKey) {
            console.error('❌ CRITICAL: No OpenRouter API key found!');
            console.error('❌ Set OPENROUTER_API_KEY environment variable');
            console.error('❌ Get key from: https://openrouter.ai/keys');
        }
    }

    async generateServerStructure(theme) {
        try {
            console.log(`🤖 Generating structure for theme:`, theme);
            
            // Step 1: Enhance the user's prompt using fast LLM
            const enhancedTheme = await this.enhanceTheme(theme);
            console.log(`✨ Enhanced theme:`, enhancedTheme);
            
            const prompt = `Design a creative Discord server for: "${enhancedTheme}"

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

Limits: 20 channels max, 1-3 voice channels. Use emojis. Make it themed and unique!`;

            // Step 2: Generate server structure using enhanced prompt
            
            const response = await axios.post(`${this.baseURL}/chat/completions`, {
                model: "anthropic/claude-3.5-haiku",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 1800
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
            console.log(`✅ AI responded with ${content.length} chars`);
            
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
            
            // Random voice channels 1-3
            const targetVoiceChannels = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
            
            if (voiceChannels > targetVoiceChannels) {
                // Trim excess voice channels
                let voiceToRemove = voiceChannels - targetVoiceChannels;
                for (const category of parsedStructure.categories) {
                    if (voiceToRemove <= 0) break;
                    for (let i = category.channels.length - 1; i >= 0 && voiceToRemove > 0; i--) {
                        if (category.channels[i].type === 'voice') {
                            category.channels.splice(i, 1);
                            voiceToRemove--;
                        }
                    }
                }
            } else if (voiceChannels < 1) {
                // Ensure at least 1 voice channel
                const lastCategory = parsedStructure.categories[parsedStructure.categories.length - 1];
                lastCategory.channels.push({ "name": "🎤general-voice", "type": "voice" });
            }
            
            const finalChannels = parsedStructure.categories.reduce((acc, cat) => acc + cat.channels.length, 0);
            const finalVoice = parsedStructure.categories.reduce((acc, cat) => 
                acc + cat.channels.filter(ch => ch.type === 'voice').length, 0);
            
            console.log(`🎯 Generated structure:`, 
                `${parsedStructure.categories.length} categories,`, 
                `${finalChannels} channels,`,
                `${finalVoice} voice,`,
                `${parsedStructure.roles.length} roles`);
            
            return parsedStructure;
            
        } catch (error) {
            console.error(`❌ AI generation failed:`, error.message);
            console.log('⚠️ Using fallback structure');
            return this.getFallbackStructure(theme);
        }
    }

    async enhanceTheme(theme) {
        try {
            const enhancePrompt = `Rewrite this Discord server theme to be more specific and detailed: "${theme}"

Make it clear what type of community this is, what activities they do, and what channels they might need.

Examples:
"gaming" → "PC gaming community focused on competitive FPS games, streaming, and tournament participation"
"music" → "hip-hop music production community for beat makers, rappers, and audio engineers to collaborate"
"anime" → "anime discussion community for seasonal anime reviews, manga discussions, and fan art sharing"

Rewrite: "${theme}"
Enhanced theme:`;

            const response = await axios.post(`${this.baseURL}/chat/completions`, {
                model: "openai/gpt-3.5-turbo",
                messages: [{ role: "user", content: enhancePrompt }],
                temperature: 0.3,
                max_tokens: 150
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://coinbound.io',
                    'X-Title': 'Discord Server Builder Bot'
                }
            });

            if (response.data?.choices?.[0]?.message?.content) {
                const enhanced = response.data.choices[0].message.content.trim()
                    .replace(/^Enhanced theme:\s*/i, '')
                    .replace(/^.*?:\s*/i, '');
                return enhanced || theme;
            }
        } catch (error) {
            console.log(`⚠️ Theme enhancement failed, using original: ${error.message}`);
        }
        
        return theme; // Fallback to original if enhancement fails
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
