const { Client, GatewayIntentBits, Collection, REST, Routes, ActivityType } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// Load commands
const commands = [];
const commandFiles = ['build.js', 'nuke.js'];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

client.once('ready', async () => {
    console.log(`${client.user.tag} is online - serving ${client.guilds.cache.size} servers`);
    
    client.user.setActivity('Building Discord Servers', { type: ActivityType.Playing });
    
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Commands registered successfully');
    } catch (error) {
        console.error('Command registration failed:', error);
    }
});

// Handle slash command interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
        console.log(`Command executed: /${interaction.commandName} by ${interaction.user.tag} in ${interaction.guild.name}`);
    } catch (error) {
        console.error(`Error executing command /${interaction.commandName}:`, error);
        
        const errorMessage = {
            content: 'There was an error while executing this command!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Handle guild join events
client.on('guildCreate', guild => {
    console.log(`Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
});

// Handle guild leave events
client.on('guildDelete', guild => {
    console.log(`Left guild: ${guild.name} (${guild.id})`);
});

// Handle errors
client.on('error', error => {
    console.error('Discord client error:', error);
});

// Handle warnings
client.on('warn', warning => {
    console.warn('Discord client warning:', warning);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Gracefully shutting down...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Gracefully shutting down...');
    client.destroy();
    process.exit(0);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    client.destroy();
    process.exit(1);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('Failed to login to Discord:', error);
    process.exit(1);
});
