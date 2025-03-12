const guilds = require('../../utils/guilds.js');
const countingBlacklist = require('../../utils/countingBlacklist.js');

module.exports = async (oldMessage) => {
    if (oldMessage.author.bot) {
        return;
    };

    if (!oldMessage.guild) {
        return;
    };

    // Return if the user is blacklisted from counting
    const blacklisted = await countingBlacklist.findOne({ discordId: oldMessage.author.id, guildId: oldMessage.guild.id }).exec();
    
    if (blacklisted) {
        return;
    };

    const guild = await guilds.findOne({ guildId: oldMessage.guild.id }).exec();

    if (!guild) {
        return;
    }

    if (oldMessage.channel.id !== guild.competetiveChannel) {
        return;
    };

    oldMessage.channel.send(`<@${oldMessage.author.id}> Deleted their message!\nThe count has been restarted.\n**The next number is 1.**`);

    guild.nextCompetetiveNumber = 1;
    guild.lastCompetetiveSender = '0';

    await guild.save();
};