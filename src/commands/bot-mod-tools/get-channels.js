const guilds = require('../../utils/guilds');
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-channels')
        .setDescription('Get the channels for a specific guild.')
        .setContexts(['Guild'])
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('guildId')
                .setDescription('The ID of the guild to get the channels for.')
                .setRequired(true)
        ),            

    run: async ({ interaction, client }) => {
        await interaction.deferReply({
            ephemeral: true,
        }).catch(console.warn);

        interaction.editReply({
            content: 'Worked',
            ephemeral: true,
        }).catch(console.warn);
    },

    options: {
        guildOnly: true,
        devOnly: true,
        userPermissions: [],
        botPermissions: ['AddReactions', 'ManageMessages', 'SendMessages', 'ViewChannel', 'ViewAuditLog'],
        deleted: false,
    },
};