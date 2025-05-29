const guilds = require('../../utils/guilds');
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('get-channels')
    .setDescription('Get the channels for a specific guild.')
    .setContexts(['Guild'])
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
        option
            .setName('guild-id')
            .setDescription('The ID of the guild to get the channels for.')
            .setRequired(true)
    ),            

    run: async ({ interaction, client }) => {
        await interaction.deferReply({
            ephemeral: true,
        }).catch(console.warn);

        const guildId = interaction.options.getString('guild-id');
        const guild = await guilds.findOne({
            guildId
        }).exec();

        if (!guild) {
            return interaction.editReply({
                content: 'This server has not been set up yet.',
                ephemeral: true,
            });
        }

        // Fetch the guild object from the client
        const targetGuild = client.guilds.cache.get(guildId);
        if (!targetGuild) {
            return interaction.editReply({
                content: 'Guild not found. Please check the guild ID.',
                ephemeral: true,
            });
        }

        // Get all channels in the guild
        const channels = targetGuild.channels.cache.map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            topic: channel.topic || 'No topic',
        }));

        // Create an embed to display the channels
        const embed = new EmbedBuilder()
            .setTitle(`Channels in ${targetGuild.name}`)
            .setDescription('Here are the channels in the specified guild:')
            .setColor('#0099ff')
            .setTimestamp();

        channels.forEach(channel => {
            embed.addFields({
                name: `${channel.name} (${channel.type})`,
                value: `ID: ${channel.id}\nTopic: ${channel.topic}`,
                inline: false,
            });
        });
        embed.setFooter({ text: `Total Channels: ${channels.length}` });
        // Send the embed as a reply
        await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
        }).catch(console.warn);

        console.log(`Fetched channels for guild: ${targetGuild.name} (${guildId})`);
    },

    options: {
        guildOnly: true,
        devOnly: true,
        userPermissions: [],
        botPermissions: [],
        deleted: false,
    },
};