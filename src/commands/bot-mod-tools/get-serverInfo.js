const {
    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlags,
} = require('discord.js');

function formatFeatures(features) {
    if (!features || features.length === 0) return 'None';
    return features.map(f => `\`${f.replace(/_/g, ' ').toLowerCase()}\``).join(', ');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('Get information about a specific server by ID.')
        .addStringOption(option =>
            option
                .setName('guild-id')
                .setDescription('The ID of the guild to get info for')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    run: async ({ interaction, client }) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(console.warn);

        const guildId = interaction.options.getString('guild-id');
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            return interaction.editReply({
                content: `Guild with ID \`${guildId}\` not found or bot is not in that guild.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        const owner = await guild.fetchOwner();

        const embed = new EmbedBuilder()
            .setTitle(`Server Info: ${guild.name}`)
            .setColor('#0099ff')
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Owner', value: `${owner.user.tag} (${owner.id})`, inline: true },
                { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
                { name: 'Members', value: `${guild.memberCount}`, inline: true },
                { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
                { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0} (Tier ${guild.premiumTier})`, inline: true },
                {
                    name: 'Features',
                    value: formatFeatures(guild.features),
                    inline: false,
                }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },

    options: {
        devOnly: true,
        userPermissions: [],
        botPermissions: [],
        deleted: false,
    },
};
