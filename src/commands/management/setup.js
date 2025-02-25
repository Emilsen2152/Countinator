const guilds = require('../../utils/guilds');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the counting channel for your server. Use this command in the counting channel.')
        .setContexts(['Guild'])
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    run: async ({ interaction, client }) => {
        const guildId = interaction.guild.id;

        let guild = await guilds.findOne({ guildId }).exec();

        if (!guild) {
            guild = new guilds({
                guildId,
                countingChannelId: interaction.channelId,
            });
        };

        return interaction.reply({
            content: 'This server has been set up for counting.',
            ephemeral: true,
        });
    },

    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: [PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
        deleted: false,
    },
};