// @/utils/discordService.js
import { Client, GatewayIntentBits, Partials, ChannelType, PermissionFlagsBits } from 'discord.js';

class DiscordService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMembers,
        ],
        partials: [Partials.Channel, Partials.Message],
      });

      await this.client.login(process.env.DISCORD_BOT_TOKEN);
      
      this.client.on('ready', () => {
        console.log(`Logged in as ${this.client.user.tag}`);
        this.isInitialized = true;
      });

      // Set up command handling
      this.client.on('messageCreate', async (message) => {
        // Ignore messages from bots (including itself)
        if (message.author.bot) return;
        
        // Process commands
        if (message.content.startsWith('!')) {
          const args = message.content.slice(1).trim().split(/ +/);
          const command = args.shift().toLowerCase();
          
          if (command === 'help') {
            await message.channel.send(
              '**OpenScholar Hub Commands:**\n' +
              '`!help` - Show this help message\n' +
              '`!project` - Get current project details\n' +
              '`!researchers` - List researchers in this project\n' +
              '`!links` - Show related research links\n'
            );
          } else if (command === 'project') {
            // Extract project ID from channel name (format: project-123-general)
            const channelName = message.channel.name;
            const projectIdMatch = channelName.match(/project-(\d+)/);
            
            if (projectIdMatch && projectIdMatch[1]) {
              const projectId = projectIdMatch[1];
              await message.channel.send(`Project details can be found at: ${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}`);
            } else {
              await message.channel.send('Could not determine project information from this channel.');
            }
          }
          
          // Additional commands can be added here
        }
      });

      // Handle errors
      this.client.on('error', (error) => {
        console.error('Discord client error:', error);
      });

    } catch (error) {
      console.error('Failed to initialize Discord client:', error);
      throw error;
    }
  }

  async getChannels(guildId = process.env.DISCORD_GUILD_ID) {
    if (!this.isInitialized) await this.initialize();
    
    const guild = await this.client.guilds.fetch(guildId);
    const channels = await guild.channels.fetch();
    
    return Array.from(channels.values())
      .filter(channel => channel.type === ChannelType.GuildText)
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        parentId: channel.parentId
      }));
  }

  async getProjectChannels(projectId, guildId = process.env.DISCORD_GUILD_ID) {
    if (!this.isInitialized) await this.initialize();
    
    const guild = await this.client.guilds.fetch(guildId);
    const channels = await guild.channels.fetch();
    
    return Array.from(channels.values())
      .filter(channel => channel.type === ChannelType.GuildText && channel.name.includes(`project-${projectId}`))
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        parentId: channel.parentId
      }));
  }

  async getMessages(channelId, limit = 50) {
    if (!this.isInitialized) await this.initialize();
    
    const channel = await this.client.channels.fetch(channelId);
    const messages = await channel.messages.fetch({ limit });
    
    return Array.from(messages.values()).map(msg => ({
      id: msg.id,
      content: msg.content,
      author: {
        id: msg.author.id,
        username: msg.author.username,
        avatar: msg.author.displayAvatarURL()
      },
      timestamp: msg.createdTimestamp,
      attachments: Array.from(msg.attachments.values()).map(attachment => ({
        id: attachment.id,
        url: attachment.url,
        name: attachment.name,
        size: attachment.size,
        contentType: attachment.contentType
      }))
    }));
  }

  async sendMessage(channelId, content, options = {}) {
    if (!this.isInitialized) await this.initialize();
    
    const channel = await this.client.channels.fetch(channelId);
    const message = await channel.send({
      content: content,
      ...options
    });
    
    return {
      id: message.id,
      content: message.content,
      timestamp: message.createdTimestamp
    };
  }
  
  async createChannel(name, options = {}, guildId = process.env.DISCORD_GUILD_ID) {
    if (!this.isInitialized) await this.initialize();
    
    const guild = await this.client.guilds.fetch(guildId);
    
    // Check if channel already exists
    const existingChannels = await guild.channels.fetch();
    const existing = Array.from(existingChannels.values()).find(c => c.name === name);
    
    if (existing) {
      return {
        id: existing.id,
        name: existing.name,
        type: existing.type,
        parentId: existing.parentId
      };
    }
    
    // Create new channel
    const channelOptions = {
      name,
      type: ChannelType.GuildText,
      ...options
    };
    
    const channel = await guild.channels.create(channelOptions);
    
    return {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      parentId: channel.parentId
    };
  }
  
  async setupProjectChannels(projectId, projectTitle) {
    if (!this.isInitialized) await this.initialize();
    
    const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    
    // Create category for project
    const categoryName = `Project: ${projectTitle.substring(0, 90)}`;
    let category;
    
    // Check if category exists
    const existingCategories = await guild.channels.fetch();
    const existingCategory = Array.from(existingCategories.values()).find(
      c => c.type === ChannelType.GuildCategory && c.name === categoryName
    );
    
    if (existingCategory) {
      category = existingCategory;
    } else {
      category = await guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory
      });
    }
    
    // Create channels under this category
    const channels = [
      { name: `project-${projectId}-general`, topic: `General discussion for ${projectTitle}` },
      { name: `project-${projectId}-research`, topic: 'Share and discuss research findings' },
      { name: `project-${projectId}-questions`, topic: 'Ask questions about the project' }
    ];
    
    const createdChannels = [];
    
    for (const channelData of channels) {
      // Check if channel exists
      const existingChannel = Array.from(existingCategories.values()).find(
        c => c.type === ChannelType.GuildText && c.name === channelData.name
      );
      
      if (existingChannel) {
        createdChannels.push({
          id: existingChannel.id,
          name: existingChannel.name,
          type: existingChannel.type,
          parentId: existingChannel.parentId
        });
        continue;
      }
      
      const channel = await guild.channels.create({
        name: channelData.name,
        type: ChannelType.GuildText,
        parent: category.id,
        topic: channelData.topic
      });
      
      createdChannels.push({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        parentId: channel.parentId
      });
    }
    
    return {
      categoryId: category.id,
      channels: createdChannels
    };
  }
  
  async createInvite(channelId = null, options = {}) {
    if (!this.isInitialized) await this.initialize();
    
    const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    
    let channel;
    if (channelId) {
      channel = await this.client.channels.fetch(channelId);
    } else {
      // Get system channel or first available text channel
      channel = guild.systemChannel || 
                Array.from(await guild.channels.fetch())
                  .find(([_, c]) => c.type === ChannelType.GuildText)[1];
    }
    
    const invite = await channel.createInvite({
      maxAge: 86400, // 24 hours
      maxUses: 1, // One-time use
      unique: true,
      ...options
    });
    
    return invite.url;
  }
  
  async addMemberToRole(userId, roleId, guildId = process.env.DISCORD_GUILD_ID) {
    if (!this.isInitialized) await this.initialize();
    
    const guild = await this.client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    await member.roles.add(roleId);
    
    return true;
  }
}

// Singleton instance
const discordService = new DiscordService();
export default discordService;