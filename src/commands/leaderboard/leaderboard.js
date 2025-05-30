const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js'); 
const guilds = require('../../utils/guilds.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Sends the leaderboard of the best servers.'),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const bestGuilds = await guilds.find({ 
            competitiveChannel: { $ne: '0', $exists: true } // Combined conditions
        }).sort({ nextCompetitiveNumber: -1 }).limit(50).exec();

        if (!bestGuilds.length) {
            return interaction.editReply({ content: 'No competitive servers found.', flags: MessageFlags.Ephemeral });
        }

        const leaderboard = await Promise.all(bestGuilds.map(async (guild, index) => {
            const fetchedGuild = await client.guilds.fetch(guild.guildId).catch(() => null);
            const guildName = fetchedGuild ? fetchedGuild.name : 'Unknown Server';
            return `**${index + 1}.** ${guildName} - ${guild.nextCompetitiveNumber -1 }`;
        }));

        // Split into multiple embeds if the text is too long
        const embeds = [];
        const chunkSize = 4000; // Discord embed description limit is 4096 characters
        let currentChunk = '';

        leaderboard.forEach((entry) => {
            if ((currentChunk + entry).length > chunkSize) {
                embeds.push(new EmbedBuilder()
                    .setTitle('🏆 Server leaderboard')
                    .setDescription(currentChunk)
                    .setColor('#FFD700')
                );
                currentChunk = '';
            }
            currentChunk += entry + '\n';
        });

        if (currentChunk) {
            embeds.push(new EmbedBuilder()
                .setTitle('🏆 Competitive Server Leaderboard')
                .setDescription(currentChunk)
                .setColor('#FFD700')
            );
        }

        await interaction.editReply({ embeds });
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: [],
        deleted: false,
    },
};
