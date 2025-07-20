const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const OpenRouterClient = require('../utils/openrouter');
const ServerBuilder = require('../utils/serverBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('build')
        .setDescription('Build a themed Discord server structure')
        .addStringOption(option =>
            option.setName('theme')
                .setDescription('Describe your ideal server theme (e.g., "gaming community with tournaments")')
                .setRequired(true)
                .setMaxLength(300)
        ),
    
    async execute(interaction) {
        const theme = interaction.options.getString('theme');
        
        try {
            if (!interaction.memberPermissions?.has('ManageChannels')) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Permission Denied')
                    .setDescription('You need the "Manage Channels" permission to use this command.')
                    .setTimestamp();
                
                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });

            const statusEmbed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('Building Server...')
                .setDescription(`Generating server structure for theme: **${theme}**`)
                .setTimestamp();

            await interaction.editReply({ embeds: [statusEmbed] });

            const openRouter = new OpenRouterClient(process.env.OPENROUTER_API_KEY);
            const structure = await openRouter.generateServerStructure(theme);

            if (!structure?.categories || !structure?.roles) {
                throw new Error('Invalid server structure generated');
            }

            const totalChannels = structure.categories.reduce((acc, cat) => acc + cat.channels.length, 0);

            const buildingEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Creating Channels & Roles...')
                .setDescription(`Creating ${structure.categories.length} categories, ${totalChannels} channels, and ${structure.roles.length} roles`)
                .setTimestamp();

            await interaction.editReply({ embeds: [buildingEmbed] });

            const serverBuilder = new ServerBuilder(interaction.guild);
            const results = await serverBuilder.buildServer(structure);

            const successEmbed = new EmbedBuilder()
                .setColor(results.errors.length > 0 ? 0xFFA500 : 0x00FF00)
                .setTitle('Server Built Successfully!')
                .setDescription(`**Theme:** ${theme}`)
                .addFields(
                    { name: 'Categories', value: `${results.categories.length}`, inline: true },
                    { name: 'Channels', value: `${results.channels.length}`, inline: true },
                    { name: 'Roles', value: `${results.roles.length}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Powered by Coinbound' });

            if (results.errors.length > 0) {
                successEmbed.addFields({
                    name: 'Warnings',
                    value: results.errors.slice(0, 3).join('\n') + (results.errors.length > 3 ? `\n...and ${results.errors.length - 3} more` : ''),
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Build command error:', error.message);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Build Failed')
                .setDescription(`Failed to build server: ${error.message}`)
                .setTimestamp()
                .setFooter({ text: 'Please try again or contact support' });

            try {
                await interaction.editReply({ embeds: [errorEmbed] });
            } catch (replyError) {
                console.error('Failed to send error reply:', replyError.message);
            }
        }
    },
};
