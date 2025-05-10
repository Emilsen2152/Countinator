const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong! Gives you the bot\'s ping'),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const reply = await interaction.fetchReply();

        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply(`Pong! Client: ${ping}ms | Websocket: ${client.ws.ping} ms`); 
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: [],
        deleted: false,
    },
};