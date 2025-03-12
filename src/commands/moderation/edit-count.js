const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const guilds = require('../../utils/guilds.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('edit-count')
    .setDescription('Edit the count')
    .setContexts(['Guild'])
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) => 
        option
            .setName('new-count')
            .setDescription('What should the next number be?')
            .setRequired(true)),
        
    run: async ({ interaction, client }) => {
        await interaction.deferReply({
            ephemeral: true
        }).catch(console.warn);
        const guildId = interaction.guild.id;
        const guild = await guilds.findOne({
            guildId
        }).exec();

        if (!guild) {
            return interaction.editReply({
                content: 'This server has not been set up yet. Please run the `/setup` command first.',
                ephemeral: true
            });
        }

        const nextCount = interaction.options.getInteger('new-count');

        if (nextCount < 1) {
            return interaction.editReply({
                content: 'The next number must be at least 1.',
                ephemeral: true
            });
        };

        guild.nextNumber = nextCount;
        guild.lastSender = '0';

        guild.save();

        const countingChannel = client.channels.cache.get(guild.countingChannel);

        if (!countingChannel) {
            return interaction.editReply({
                content: 'Counting channel not found. Please run the `/setup` command again.',
                ephemeral: true
            });
        }

        countingChannel.send({
            content: `The next number has been edited to: ${nextCount.toString()}`
        }).catch(console.warn);

        interaction.editReply({
            content: 'Updated!',
            ephemeral: true
        });
    },
    gaOnly: true,

    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: ['SendMessages', 'ViewChannel'],
        deleted: false,
    },
};  