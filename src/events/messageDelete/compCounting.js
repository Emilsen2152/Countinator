const guilds = require('../../utils/guilds.js');
const countingBlacklist = require('../../utils/countingBlacklist.js');

module.exports = async (oldMessage) => {
    if (oldMessage.author.bot || !oldMessage.guild) {
        return;
    }

    // Fetch audit logs to check if the message was deleted by a bot
    const auditLogs = await oldMessage.guild.fetchAuditLogs({ type: 72, limit: 1 });
    const entry = auditLogs.entries.first();

    if (entry.target.id === oldMessage.author.id) {
        return;
    }

    // Return if the user is blacklisted from counting
    const blacklisted = await countingBlacklist.findOne({ discordId: oldMessage.author.id, guildId: oldMessage.guild.id }).exec();
    if (blacklisted) {
        return;
    }

    const guild = await guilds.findOne({ guildId: oldMessage.guild.id }).exec();
    if (!guild || oldMessage.channel.id !== guild.competitiveChannel) {
        return;
    }

    oldMessage.channel.send(`<@${oldMessage.author.id}> deleted their message!\nThe count has been restarted.\n**The next number is 1.**`);

    guild.nextCompetitiveNumber = 1;
    guild.lastCompetitiveSender = '0';
    await guild.save();
};
