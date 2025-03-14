const guilds = require('../../utils/guilds.js');
const countingBlacklist = require('../../utils/countingBlacklist.js');

module.exports = async (oldMessage, newMessage) => {
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

    if (oldMessage.channel.id !== guild.competitiveChannel) {
        return;
    };

    if (oldMessage.content === newMessage.content) {
        return;
    };

    newMessage.channel.send(`<@${newMessage.author.id}> Edited their message!\nThe count has been restarted.\n**The next number is 1.**`).catch(console.warn);

    guild.nextCompetitiveNumber = 1;
    guild.lastCompetitiveSender = '0';

    await guild.save();
};