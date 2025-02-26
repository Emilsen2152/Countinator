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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

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
                        if (button.customId !== i.customId) {
                            button.disabled = true;
                        }
                    });

                    i.message.edit({ components: [i.message.components[0]] }).catch(console.warn);
                });

                collector.on('end', (_, reason) => {
                    if (reason === 'time') {
                        reject('No response was collected.');
                    }
                });
            });
        }

        const guildId = interaction.guild.id;

        let guild = await guilds.findOne({ guildId }).exec();

        if (!guild) {
            guild = new guilds({
                guildId,
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
    },

    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: [PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
        deleted: false,
    },
};