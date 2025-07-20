const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ServerBuilder = require('../utils/serverBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Delete all channels and roles except general, then create basic roles'),
    
    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has('Administrator')) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Permission Denied')
                    .setDescription('You need Administrator permissions to use this command.')
                    .setTimestamp();
                
                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const confirmEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('DANGER: Server Nuke')
                .setDescription('**This action will:**\n\n• Delete ALL channels (except #general)\n• Delete ALL categories\n• Delete ALL custom roles\n• Create basic roles (Member, Moderator, Admin)\n\n**This action cannot be undone!**')
                .setTimestamp()
                .setFooter({ text: 'Are you absolutely sure?' });

            const confirmRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('nuke_confirm')
                        .setLabel('Yes, Nuke Server')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('nuke_cancel')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                );

            const response = await interaction.reply({ 
                embeds: [confirmEmbed], 
                components: [confirmRow],
                ephemeral: true 
            });

            const collector = response.createMessageComponentCollector({ time: 30000 });

            collector.on('collect', async (buttonInteraction) => {
                try {
                    if (buttonInteraction.user.id !== interaction.user.id) {
                        return await buttonInteraction.reply({ 
                            content: 'Only the command user can confirm this action.', 
                            ephemeral: true 
                        });
                    }

                    if (buttonInteraction.customId === 'nuke_cancel') {
                        const cancelEmbed = new EmbedBuilder()
                            .setColor(0x95A5A6)
                            .setTitle('Nuke Cancelled')
                            .setDescription('Server nuke has been cancelled. No changes were made.')
                            .setTimestamp();

                        await buttonInteraction.update({ 
                            embeds: [cancelEmbed], 
                            components: [] 
                        });
                        collector.stop();
                        return;
                    }

                    if (buttonInteraction.customId === 'nuke_confirm') {
                        await buttonInteraction.deferUpdate();

                        const processingEmbed = new EmbedBuilder()
                            .setColor(0xFFFF00)
                            .setTitle('Nuking Server...')
                            .setDescription('Please wait while I delete channels and roles...')
                            .setTimestamp();

                        await buttonInteraction.editReply({ 
                            embeds: [processingEmbed], 
                            components: [] 
                        });

                        const serverBuilder = new ServerBuilder(interaction.guild);
                        const results = await serverBuilder.nukeServer();

                        const successEmbed = new EmbedBuilder()
                            .setColor(results.errors.length > 0 ? 0xFFA500 : 0x00FF00)
                            .setTitle('Server Nuked Successfully!')
                            .setDescription('Server has been reset to basic configuration.')
                            .addFields(
                                { name: 'Channels Deleted', value: `${results.deletedChannels}`, inline: true },
                                { name: 'Roles Deleted', value: `${results.deletedRoles}`, inline: true },
                                { name: 'Basic Roles Created', value: '3', inline: true }
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

                        await buttonInteraction.editReply({ embeds: [successEmbed] });
                        collector.stop();
                    }
                } catch (error) {
                    console.error('Button interaction error:', error.message);
                    
                    const errorEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('Nuke Failed')
                        .setDescription(`Failed to nuke server: ${error.message}`)
                        .setTimestamp();

                    try {
                        await buttonInteraction.editReply({ embeds: [errorEmbed], components: [] });
                    } catch (replyError) {
                        console.error('Failed to send error reply:', replyError.message);
                    }
                    collector.stop();
                }
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    try {
                        const timeoutEmbed = new EmbedBuilder()
                            .setColor(0x95A5A6)
                            .setTitle('Confirmation Timeout')
                            .setDescription('Nuke confirmation timed out. No changes were made.')
                            .setTimestamp();

                        await interaction.editReply({ 
                            embeds: [timeoutEmbed], 
                            components: [] 
                        });
                    } catch (error) {
                        console.log('Timeout handler: Interaction already handled');
                    }
                }
            });

        } catch (error) {
            console.error('Nuke command error:', error.message);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Command Failed')
                .setDescription(`Failed to execute nuke command: ${error.message}`)
                .setTimestamp();

            try {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            } catch (replyError) {
                console.error('Failed to send error reply:', replyError.message);
            }
        }
    },
};
