const guilds = require('../../utils/guilds');
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    MessageFlags,
    ChannelType,
} = require('discord.js');

function getChannelTypeName(typeNumber) {
    return Object.entries(ChannelType).find(([_, v]) => v === typeNumber)?.[0] || 'Unknown';
}

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
            flags: MessageFlags.Ephemeral,
        }).catch(console.warn);

        const guildId = interaction.options.getString('guild-id');
        const guild = await guilds.findOne({ guildId }).exec();

        if (!guild) {
            return interaction.editReply({
                content: 'This server has not been set up yet.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const targetGuild = client.guilds.cache.get(guildId);
        if (!targetGuild) {
            return interaction.editReply({
                content: 'Guild not found. Please check the guild ID.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const channels = targetGuild.channels.cache.map(channel => ({
            id: channel.id,
            name: channel.name,
            type: getChannelTypeName(channel.type),
            topic: channel.topic || 'No topic',
        }));

        // Split channels into chunks of 25 per embed
        const channelChunks = [];
        for (let i = 0; i < channels.length; i += 25) {
            channelChunks.push(channels.slice(i, i + 25));
        }

        // Map each chunk to an embed
        const allEmbeds = channelChunks.map((chunk, index) => {
            const embed = new EmbedBuilder()
                .setTitle(`Channels in ${targetGuild.name} (Page ${index + 1})`)
                .setDescription('Here are the channels in the specified guild:')
                .setColor('#0099ff')
                .setTimestamp();

            chunk.forEach(channel => {
                embed.addFields({
                    name: `${channel.name} (${channel.type})`,
                    value: `ID: ${channel.id}\nTopic: ${channel.topic}`,
                    inline: false,
                });
            });

            embed.setFooter({
                text: `Channels ${index * 25 + 1}–${index * 25 + chunk.length} of ${channels.length}`,
            });

            return embed;
        });

        // Split embeds into groups of 10 per message (Discord limit)
        const embedGroups = [];
        for (let i = 0; i < allEmbeds.length; i += 10) {
            embedGroups.push(allEmbeds.slice(i, i + 10));
        }

        // Edit the initial reply with the first group
        await interaction.editReply({
            content: `Showing ${channels.length} channels in ${targetGuild.name}:`,
            embeds: embedGroups[0],
            flags: MessageFlags.Ephemeral,
        });

        // Send remaining embed groups as follow-ups
        for (let i = 1; i < embedGroups.length; i++) {
            await interaction.followUp({
                embeds: embedGroups[i],
                flags: MessageFlags.Ephemeral,
            }).catch(console.warn);
        }

        console.log(`Fetched ${channels.length} channels for guild: ${targetGuild.name} (${guildId})`);
    },

    options: {
        devOnly: true,
        userPermissions: [],
        botPermissions: [],
        deleted: false,
    },
};
