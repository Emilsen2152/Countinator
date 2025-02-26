const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const guilds = require('../../utils/guilds.js');
const countingBlacklist = require('../../utils/countingBlacklist.js');
const { options } = require('../management/setup.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('counting-blacklist')
        .setDescription('Commands related to the counting blacklist')
        .setContexts(['Guild'])
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a user to the counting blacklist')
                .addUserOption(option => option.setName('user').setDescription('Who do you want to blacklist?').setRequired(true))
                .addStringOption(option => option.setName('reason').setDescription('What is the reason for blacklisting this user?').setRequired(true))
                .addIntegerOption(option => option.setName('hours').setDescription("How long should this blacklist last?").setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a user from the counting blacklist')
                .addUserOption(option => option.setName('user').setDescription("Whos blacklist do you want to remove?").setRequired(true))),
    run: async ({ interaction, client }) => {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const guild = await guilds.findOne({ guildId }).exec();

        if (!guild) {
            return interaction.reply({
                content: 'This server has not been set up yet. Please run the `/setup` command first.',
                ephemeral: true
            });
        };

        if (subcommand === 'add') {
            await interaction.deferReply({
                ephemeral: true
            });
            
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason');
            const hours = interaction.options.getInteger('hours');

            let expiration;
            let permanent = false;

            if (hours) {
                expiration = new Date(Date.now() + hours * 60 * 60 * 1000);
            } else {
                permanent = true;
                expiration = new Date(Date.now());
            }

            const newBlacklist = new countingBlacklist({
                guildId: guildId,
                discordId: user.id,
                reason: reason,
                addedBy: interaction.user.id,
                expiration: expiration,
                permanent: permanent
            });

            await newBlacklist.save();

            interaction.reply({
                content: `User <@${user.id}> has been blacklisted for reason: ${reason}.`,
                ephemeral: true
            });

            const embed = new EmbedBuilder()
                .setTitle('You have been blacklisted from the counting channel in ' + interaction.guild.name + '.')
                .setDescription('If you want to appeal this blacklist contact staff in ' + interaction.guild.name + '.')
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Expiration', value: permanent ? 'Permanent' : `<t:${Math.floor(expiration.getTime() / 1000)}:F>` }
                );

            user.send({ embeds: [embed] }).catch(e => {
                console.warn(e);
                interaction.followUp({
                    content: 'User has been blacklisted, but I was unable to send them a DM.',
                    ephemeral: true
                });
            });
        } else if (subcommand === 'remove') {
            await interaction.deferReply({
                ephemeral: true
            });
            const user = interaction.options.getUser('user');

            const blacklisted = await countingBlacklist.findOneAndDelete({ guildId: guildId, discordId: user.id }).exec();

            if (!blacklisted) {
                interaction.reply({
                    content: `User <@${user.id}> is not blacklisted.`,
                    ephemeral: true
                });
                return;
            };

            interaction.reply({
                content: `User <@${user.id}> has been removed from the blacklist.`,
                ephemeral: true
            });

            user.send(`You have been removed from the counting blacklist in ${interaction.guild.name}.`).catch(e => {
                console.warn(e);
            });
        };
    },
    
    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: [PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
        deleted: false,
    },
};

