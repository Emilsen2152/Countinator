const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    client.guilds.cache.forEach(async guild => {
        console.log(`${guild.name} | ${guild.id}`);

        // Send information to the owner
        const owner = await guild.fetchOwner().catch(console.warn);
        const embed = new EmbedBuilder()
            .setTitle('Introducing competitive counting!')
            .setDescription('Competitive counting is a new way to count in your server. It is a fun and competitive way to count to infinity. The rules are simple: you must count in order, and you must wait for someone else to count before you can count again. If you make a mistake, the count will be reset to 1.')
            .addFields(
                { name: 'How to start', value: 'To start competitive counting, type `/setup competetive` in your server.' },
                { name: 'Leaderboard', value: 'To view the leaderboard, type `/leaderboard` in your server.' },
                { name: 'Questions', value: 'If you have any questions, please contact the bot owner.' },
            )
            .setColor('#FF0000');
        owner.send({ embeds: [embed] }).catch(console.warn);
    });
};
