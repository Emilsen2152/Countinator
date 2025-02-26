const guilds = require('../../utils/guilds.js');
const countingBlacklist = require('../../utils/countingBlacklist.js');

module.exports = async (message) => {
    if (message.author.bot) {
        return;
    };

    if (!message.guild) {
        return;
    };

    // Return if the user is blacklisted from counting
    const blacklisted = await countingBlacklist.findOne({ discordId: message.author.id, guildId: message.guild.id }).exec();
    
    if (blacklisted) {
        return;
    };

    const guild = await guilds.findOne({ guildId: message.guild.id }).exec();

    if (!guild) {
        return;
    }

    if (message.channel.id !== guild.countingChannel) {
        return;
    };

    message.channel.send(`<@${message.author.id}> Deleted their message!\nThe count has been restarted.\n**The next number is 1.**`);

    guild.nextNumber = 1;
    guild.lastNumberSenderId = '0';

    await guild.save();
};