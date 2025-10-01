const {
    SlashCommandBuilder,
    MessageFlags,
} = require('discord.js');

function formatFeatures(features) {
    if (!features || features.length === 0) return 'None';
    return features.map(f => `\`${f.replace(/_/g, ' ').toLowerCase()}\``).join(', ');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave-server')
        .setDescription('Make the bot leave a specified server by its ID.')
        .addStringOption(option =>
            option
                .setName('guild-id')
                .setDescription('The ID of the guild to leave.')
                .setRequired(true)
        ),

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

        await guild.leave();

        return interaction.editReply({
            content: `Successfully left the guild: **${guild.name}** (ID: \`${guild.id}\`).`,
            flags: MessageFlags.Ephemeral,
        });
    },

    options: {
        devOnly: true,
        userPermissions: [],
        botPermissions: [],
        deleted: false,
    },
};
