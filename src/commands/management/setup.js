const guilds = require('../../utils/guilds');
const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const acceptButton = new ButtonBuilder()
    .setCustomId('ALLOW')
    .setLabel('Allow')
    .setStyle(ButtonStyle.Success);

const ignoreButton = new ButtonBuilder()
    .setCustomId('IGNORE')
    .setLabel('Ignore Message')
    .setStyle(ButtonStyle.Secondary);

const deleteButton = new ButtonBuilder()
    .setCustomId('DELETE')
    .setLabel('Delete Message')
    .setStyle(ButtonStyle.Primary);

const restartButton = new ButtonBuilder()
    .setCustomId('RESTART')
    .setLabel('Restart Counting')
    .setStyle(ButtonStyle.Danger);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the counting channel for your server. Use this command in the counting channel.')
        .setContexts(['Guild'])
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Setup the counting channel for your server. Use this command in the counting channel.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('competetive')
                .setDescription('Setup the competetive counting channel for your server. Use this command in the competetive counting channel.')),

    run: async ({ interaction, client }) => {
        await interaction.deferReply().catch(console.warn);

        function collectResponse() {
            return new Promise((resolve, reject) => {
                const collector = interaction.channel.createMessageComponentCollector({
                    filter: i => i.user.id === interaction.user.id,
                    time: 60000,
                });

                collector.on('collect', i => {
                    collector.stop();
                    resolve(i);

                    // Disable other buttons
                    i.message.components[0].components.forEach(button => {

                        button.data.disabled = true;


                        i.message.edit({ components: [i.message.components[0]] }).catch(console.warn);
                    });
                });

                collector.on('end', (_, reason) => {
                    if (reason === 'time') {
                        reject('No response was collected.');
                    }
                });
            });
        }

        let guild = await guilds.findOne({ guildId: interaction.guild.id }).exec();

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'server') {
            if (!guild) {
                guild = new guilds({
                    guildId: interaction.guild.id,
                    countingChannel: interaction.channelId,
                });
            } else {
                guild.countingChannel = interaction.channelId;
            };

            try {
                interaction.editReply('Setup started.').catch(console.warn);

                const incorrectNumberRow = new ActionRowBuilder()
                    .addComponents(ignoreButton, deleteButton, restartButton);

                let lastMessage = await interaction.channel.send({
                    content: 'What should happen if the incorrect number is sent?',
                    components: [incorrectNumberRow],
                    withResponse: true
                });

                const incorrectNumberResponse = await collectResponse();

                guild.incorrectNumber = incorrectNumberResponse.customId;
                incorrectNumberResponse.reply('Registered.').catch(console.warn);

                const wasLastSenderRow = new ActionRowBuilder()
                    .addComponents(acceptButton, ignoreButton, deleteButton, restartButton);

                lastMessage = await lastMessage.reply({
                    content: 'What should happen if someone counts twice?',
                    components: [wasLastSenderRow],
                    withResponse: true,
                });

                const wasLastSenderResponse = await collectResponse();

                guild.wasLastSender = wasLastSenderResponse.customId;
                wasLastSenderResponse.reply('Registered.').catch(console.warn);

                const notMathRow = new ActionRowBuilder()
                    .addComponents(ignoreButton, deleteButton, restartButton);

                lastMessage = await lastMessage.reply({
                    content: 'What should happen if the message sent is not a mathematical expression?',
                    components: [notMathRow],
                    withResponse: true,
                });

                const notMathResponse = await collectResponse();

                guild.notMath = notMathResponse.customId;
                notMathResponse.reply('Registered.').catch(console.warn);

                const notWholeNumberRow = new ActionRowBuilder()
                    .addComponents(ignoreButton, deleteButton, restartButton);

                lastMessage = await lastMessage.reply({
                    content: 'What should happen if the message sent is not a whole number?',
                    components: [notWholeNumberRow],
                    withResponse: true,
                });

                const notWholeNumberResponse = await collectResponse();

                guild.notWholeNumber = notWholeNumberResponse.customId;
                notWholeNumberResponse.reply('Registered.').catch(console.warn);

                await guild.save();

                lastMessage.reply('Setup completed.').catch(console.warn);

            } catch (error) {
                console.warn(error);

                if (error === 'No response was collected.') {
                    await interaction.followUp('No response was collected. Please try again.').catch(console.warn);
                } else {
                    await interaction.followUp('An error occurred. Please try again.').catch(console.warn);
                }
            }
        } else if (subcommand === 'competetive') {
            if (!guild) {
                guild = new guilds({
                    guildId: interaction.guild.id,
                    competetiveChannel: interaction.channelId,
                });
            } else {
                guild.competetiveChannel = interaction.channelId;
            };

            const acceptTermsButton = new ButtonBuilder()
                .setCustomId('AcceptTerms')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success);

            const declineTermsButton = new ButtonBuilder()
                .setCustomId('DeclineTerms')
                .setLabel('Decline')
                .setStyle(ButtonStyle.Danger);
            
            const termsRow = new ActionRowBuilder()
                .addComponents(acceptTermsButton, declineTermsButton);

            let lastMessage = await interaction.channel.send({
                content: 'By setting up the competetive counting channel you agree that the bot can show your server name in the global leaderboard.',
                components: [termsRow],
                withResponse: true
            });

            const termsResponse = await collectResponse();

            if (termsResponse.customId === 'DeclineTerms') {
                return termsResponse.reply('Setup cancelled.').catch(console.warn);
            };

            guild.nextCompetetiveNumber = 1;
            guild.lastCompetetiveSender = '0';

            await guild.save();

            lastMessage.reply('Setup completed.').catch(console.warn);

            interaction.channel.send({
                content: '**Welcome to the competetive counting channel!**\n\nThe rules are simple:\n- You must count up from 1.\n- You must wait for someone else to count before you can count again.\n- If you make a mistake, the count will be restarted.\n\nGood luck!',
            }).catch(console.warn);
        };
    },

    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: [PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
        deleted: false,
    },
};