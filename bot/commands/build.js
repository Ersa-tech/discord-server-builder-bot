const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const OpenRouterClient = require('../utils/openrouter');
const ServerBuilder = require('../utils/serverBuilder');

// Simple in-memory cooldown system (60 seconds for build command)
const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 1000; // 60 seconds

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
    const commandStartTime = Date.now();
    const theme = interaction.options.getString('theme');
    const userId = interaction.user.id;

    try {
      console.log(`🎮 [${new Date().toISOString()}] Build command started by ${interaction.user.tag} in ${interaction.guild.name}`);
      console.log(`🎯 [Build Request] Theme: "${theme}"`);

      // Check cooldown
      const lastUsed = cooldowns.get(userId);
      if (lastUsed && (Date.now() - lastUsed) < COOLDOWN_TIME) {
        const remainingTime = Math.ceil((COOLDOWN_TIME - (Date.now() - lastUsed)) / 1000);
        const cooldownEmbed = new EmbedBuilder()
          .setColor(0xFFA500)
          .setTitle('Command Cooldown')
          .setDescription(`Please wait ${remainingTime} more seconds before using /build again.`)
          .setTimestamp()
          .setFooter({ text: 'This prevents server spam and ensures quality' });

        console.log(`⏰ [Cooldown] User ${interaction.user.tag} blocked for ${remainingTime}s`);
        return await interaction.reply({ embeds: [cooldownEmbed], flags: MessageFlags.Ephemeral });
      }

      // Set cooldown
      cooldowns.set(userId, Date.now());

      // Permission check
      if (!interaction.memberPermissions?.has('ManageChannels')) {
        console.log(`❌ [Permission Denied] User ${interaction.user.tag} lacks ManageChannels permission`);
        const errorEmbed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('Permission Denied')
          .setDescription('You need the "Manage Channels" permission to use this command.')
          .setTimestamp();
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
      }

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Phase 1: Show initial status
      const statusEmbed = new EmbedBuilder()
        .setColor(0xFFFF00)
        .setTitle('🤖 Generating Server Structure...')
        .setDescription(`**Theme:** ${theme}\n\n🧠 AI is analyzing your theme and generating a professional server structure...`)
        .addFields(
          { name: '📋 Status', value: 'Connecting to AI...', inline: true },
          { name: '⏱️ Est. Time', value: '30-60 seconds', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Step 1/3: AI Generation' });

      await interaction.editReply({ embeds: [statusEmbed] });

      // Phase 2: Generate structure with OpenRouter
      const aiStartTime = Date.now();
      console.log(`🤖 [AI Generation] Starting for theme: "${theme}"`);
      
      const openRouter = new OpenRouterClient(process.env.OPENROUTER_API_KEY);
      const structure = await openRouter.generateServerStructure(theme);
      
      const aiTime = Date.now() - aiStartTime;
      console.log(`🤖 [AI Generation] Completed in ${aiTime}ms`);

      if (!structure?.categories || !structure?.roles) {
        throw new Error('Invalid server structure generated');
      }

      const totalChannels = structure.categories.reduce((acc, cat) => acc + cat.channels.length, 0);
      const voiceChannels = structure.categories.reduce((acc, cat) => 
        acc + cat.channels.filter(ch => ch.type === 'voice').length, 0);

      // Phase 3: Show structure preview
      const buildingEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🏗️ Creating Server Structure...')
        .setDescription(`**Theme:** ${theme}\n\n✅ AI generated a professional server structure!`)
        .addFields(
          { name: '📂 Categories', value: `${structure.categories.length}`, inline: true },
          { name: '📺 Channels', value: `${totalChannels} (${voiceChannels} voice)`, inline: true },
          { name: '👥 Roles', value: `${structure.roles.length}`, inline: true },
          { name: '📋 Status', value: 'Creating channels & roles...', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `Step 2/3: Building Server • AI took ${aiTime}ms` });

      await interaction.editReply({ embeds: [buildingEmbed] });

      // Phase 4: Build the server
      const buildStartTime = Date.now();
      console.log(`🏗️ [Server Build] Starting Discord operations`);
      
      const serverBuilder = new ServerBuilder(interaction.guild);
      const results = await serverBuilder.buildServer(structure);
      
      const buildTime = Date.now() - buildStartTime;
      const totalTime = Date.now() - commandStartTime;
      
      console.log(`🏗️ [Server Build] Completed in ${buildTime}ms`);
      console.log(`🎯 [Command Complete] Total time: ${totalTime}ms (AI: ${aiTime}ms, Build: ${buildTime}ms)`);

      // Phase 5: Show final results
      const successColor = results.errors.length > 0 ? 0xFFA500 : 0x00FF00;
      const successEmbed = new EmbedBuilder()
        .setColor(successColor)
        .setTitle('🎉 Server Built Successfully!')
        .setDescription(`**Theme:** ${theme}\n\n✨ Your professional Discord server is ready!`)
        .addFields(
          { name: '📂 Categories Created', value: `${results.categories.length}`, inline: true },
          { name: '📺 Channels Created', value: `${results.channels.length}`, inline: true },
          { name: '👥 Roles Created', value: `${results.roles.length}`, inline: true },
          { name: '⏱️ Total Time', value: `${totalTime}ms`, inline: true },
          { name: '🤖 AI Time', value: `${aiTime}ms`, inline: true },
          { name: '🏗️ Build Time', value: `${buildTime}ms`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Powered by Coinbound • Professional Discord Automation' });

      // Add performance insights
      if (results.timings) {
        const avgRoleTime = results.timings.individual_operations
          .filter(op => op.type === 'role')
          .reduce((sum, op, _, arr) => sum + op.time_ms / arr.length, 0);
        
        const avgChannelTime = results.timings.individual_operations
          .filter(op => op.type === 'channel')
          .reduce((sum, op, _, arr) => sum + op.time_ms / arr.length, 0);

        if (avgRoleTime > 0 && avgChannelTime > 0) {
          successEmbed.addFields({
            name: '📊 Performance',
            value: `Avg role: ${Math.round(avgRoleTime)}ms • Avg channel: ${Math.round(avgChannelTime)}ms`,
            inline: false
          });
        }
      }

      // Add warnings if any
      if (results.errors.length > 0) {
        const errorSummary = results.errors.slice(0, 3).join('\n');
        const moreErrors = results.errors.length > 3 ? `\n...and ${results.errors.length - 3} more` : '';
        
        successEmbed.addFields({
          name: '⚠️ Warnings',
          value: errorSummary + moreErrors,
          inline: false
        });
        
        console.log(`⚠️ [Build Warnings] ${results.errors.length} issues encountered:`, results.errors);
      }

      // Add structure preview
      const categoryNames = results.categories.map(cat => cat.name).slice(0, 4);
      const roleNames = results.roles.map(role => role.name).slice(0, 4);
      
      if (categoryNames.length > 0) {
        successEmbed.addFields({
          name: '📂 Categories Created',
          value: categoryNames.join(', ') + (results.categories.length > 4 ? '...' : ''),
          inline: false
        });
      }
      
      if (roleNames.length > 0) {
        successEmbed.addFields({
          name: '👥 Roles Created',
          value: roleNames.join(', ') + (results.roles.length > 4 ? '...' : ''),
          inline: false
        });
      }

      await interaction.editReply({ embeds: [successEmbed] });

      // Log successful completion
      console.log(`✅ [Build Success] ${interaction.user.tag} successfully built "${theme}" server`);
      console.log(`📊 [Final Stats]`, {
        theme: theme,
        user: interaction.user.tag,
        guild: interaction.guild.name,
        categories: results.categories.length,
        channels: results.channels.length,
        roles: results.roles.length,
        errors: results.errors.length,
        total_time_ms: totalTime,
        ai_time_ms: aiTime,
        build_time_ms: buildTime
      });

    } catch (error) {
      const totalTime = Date.now() - commandStartTime;
      
      console.error(`❌ [Build Failed] Command error after ${totalTime}ms:`, error.message);
      console.error(`🔴 [Error Context]`, {
        theme: theme,
        user: interaction.user.tag,
        guild: interaction.guild.name,
        error_type: error.name,
        error_message: error.message,
        stack: error.stack
      });

      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('❌ Build Failed')
        .setDescription(`Failed to build server: ${error.message}`)
        .addFields(
          { name: '🎯 Theme', value: theme, inline: true },
          { name: '⏱️ Time Elapsed', value: `${totalTime}ms`, inline: true },
          { name: '🔧 Next Steps', value: 'Try again or contact support if the issue persists', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'Please try again or contact support' });

      try {
        await interaction.editReply({ embeds: [errorEmbed] });
      } catch (replyError) {
        console.error(`❌ [Reply Failed] Could not send error reply:`, replyError.message);
      }
    }
  },
};
