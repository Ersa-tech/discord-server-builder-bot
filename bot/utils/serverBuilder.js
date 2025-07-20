const { ChannelType, PermissionFlagsBits } = require('discord.js');

class ServerBuilder {
    constructor(guild) {
        this.guild = guild;
    }

    async buildServer(structure) {
        const results = {
            categories: [],
            channels: [],
            roles: [],
            errors: []
        };

        try {
            // Create roles first
            for (const roleData of structure.roles) {
                try {
                    const permissions = this.getSafePermissions(roleData.permissions || [], this.guild.members.me.permissions);
                    
                    const role = await this.guild.roles.create({
                        name: roleData.name,
                        color: roleData.color || '#99AAB5',
                        permissions: permissions,
                        reason: 'Server build - Auto-generated role'
                    });
                    
                    results.roles.push(role);
                    console.log(`Created role: ${role.name}`);
                } catch (error) {
                    console.error(`Failed to create role ${roleData.name}:`, error.message);
                    results.errors.push(`Failed to create role ${roleData.name}: ${error.message}`);
                }
            }

            // Create categories and channels
            for (const categoryData of structure.categories) {
                try {
                    const category = await this.guild.channels.create({
                        name: categoryData.name,
                        type: ChannelType.GuildCategory,
                        reason: 'Server build - Auto-generated category'
                    });
                    
                    results.categories.push(category);
                    console.log(`Created category: ${category.name}`);

                    // Create channels in this category
                    for (const channelData of categoryData.channels) {
                        try {
                            const channelType = channelData.type === 'voice' ? 
                                ChannelType.GuildVoice : ChannelType.GuildText;

                            const channel = await this.guild.channels.create({
                                name: channelData.name,
                                type: channelType,
                                parent: category.id,
                                reason: 'Server build - Auto-generated channel'
                            });
                            
                            results.channels.push(channel);
                            console.log(`Created channel: ${channel.name} (${channelData.type})`);
                        } catch (error) {
                            console.error(`Failed to create channel ${channelData.name}:`, error.message);
                            results.errors.push(`Failed to create channel ${channelData.name}: ${error.message}`);
                        }
                    }
                } catch (error) {
                    console.error(`Failed to create category ${categoryData.name}:`, error.message);
                    results.errors.push(`Failed to create category ${categoryData.name}: ${error.message}`);
                }
            }

            return results;
        } catch (error) {
            console.error('Server build failed:', error.message);
            results.errors.push(`Server build failed: ${error.message}`);
            return results;
        }
    }

    async nukeServer() {
        const results = {
            deletedChannels: 0,
            deletedRoles: 0,
            errors: []
        };

        try {
            // Delete all channels except the main general channel and system channels
            const channels = this.guild.channels.cache.filter(channel => {
                if (channel.name === 'general' && channel.type === ChannelType.GuildText) {
                    return false;
                }
                if (channel.type === ChannelType.GuildSystemMessage || 
                    channel.type === ChannelType.GuildRulesAndGuidelines) {
                    return false;
                }
                return true;
            });

            for (const channel of channels.values()) {
                try {
                    await channel.delete('Server nuke command');
                    results.deletedChannels++;
                    console.log(`Deleted channel: ${channel.name}`);
                } catch (error) {
                    console.error(`Failed to delete channel ${channel.name}:`, error.message);
                    results.errors.push(`Failed to delete channel ${channel.name}: ${error.message}`);
                }
            }

            // Delete all roles except @everyone and managed roles
            const roles = this.guild.roles.cache.filter(role => {
                if (role.name === '@everyone') return false;
                if (role.managed) return false;
                if (role.position >= this.guild.members.me.roles.highest.position) return false;
                return true;
            });

            for (const role of roles.values()) {
                try {
                    await role.delete('Server nuke command');
                    results.deletedRoles++;
                    console.log(`Deleted role: ${role.name}`);
                } catch (error) {
                    console.error(`Failed to delete role ${role.name}:`, error.message);
                    results.errors.push(`Failed to delete role ${role.name}: ${error.message}`);
                }
            }

            // Create basic roles
            const basicRoles = [
                { name: 'Member', color: '#95A5A6', permissions: ['SEND_MESSAGES', 'VIEW_CHANNEL'] },
                { name: 'Moderator', color: '#3498DB', permissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES', 'VIEW_CHANNEL'] },
                { name: 'Admin', color: '#E74C3C', permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES', 'KICK_MEMBERS'] }
            ];

            for (const roleData of basicRoles) {
                try {
                    const permissions = this.getSafePermissions(roleData.permissions, this.guild.members.me.permissions);
                    
                    await this.guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        permissions: permissions,
                        reason: 'Server nuke - Basic role creation'
                    });
                    
                    console.log(`Created basic role: ${roleData.name}`);
                } catch (error) {
                    console.error(`Failed to create basic role ${roleData.name}:`, error.message);
                    results.errors.push(`Failed to create basic role ${roleData.name}: ${error.message}`);
                }
            }

            return results;
        } catch (error) {
            console.error('Server nuke failed:', error.message);
            results.errors.push(`Server nuke failed: ${error.message}`);
            return results;
        }
    }

    getSafePermissions(requestedPermissions, botPermissions) {
        let safePermissions = 0n;
        
        for (const perm of requestedPermissions) {
            const permissionFlag = this.getPermissionFlag(perm);
            if (permissionFlag && botPermissions.has(permissionFlag)) {
                safePermissions |= permissionFlag;
            }
        }
        
        return safePermissions;
    }

    getPermissionFlag(permission) {
        const permissionMap = {
            'MANAGE_CHANNELS': PermissionFlagsBits.ManageChannels,
            'MANAGE_ROLES': PermissionFlagsBits.ManageRoles,
            'MANAGE_MESSAGES': PermissionFlagsBits.ManageMessages,
            'KICK_MEMBERS': PermissionFlagsBits.KickMembers,
            'BAN_MEMBERS': PermissionFlagsBits.BanMembers,
            'SEND_MESSAGES': PermissionFlagsBits.SendMessages,
            'READ_MESSAGE_HISTORY': PermissionFlagsBits.ReadMessageHistory,
            'VIEW_CHANNEL': PermissionFlagsBits.ViewChannel,
            'CONNECT': PermissionFlagsBits.Connect,
            'SPEAK': PermissionFlagsBits.Speak,
            'MUTE_MEMBERS': PermissionFlagsBits.MuteMembers,
            'DEAFEN_MEMBERS': PermissionFlagsBits.DeafenMembers,
            'MOVE_MEMBERS': PermissionFlagsBits.MoveMembers
        };

        return permissionMap[permission];
    }
}

module.exports = ServerBuilder;
