const guilds = require('../../utils/guilds');
const countingBlacklist = require('../../utils/countingBlacklist');
const { evaluate } = require('mathjs');

module.exports = async (message) => {
    if (message.author.bot || !message.guild) return;

    // Fetch guild and blacklist concurrently
    const [guild, blacklisted] = await Promise.all([
        guilds.findOne({ guildId: message.guild.id }).exec(),
        countingBlacklist.findOne({ guildId: message.guild.id, discordId: message.author.id }).exec()
    ]);
    
    if (!guild || message.channel.id !== guild.competetiveChannel) return;
    
    if (blacklisted) {
        await message.delete().catch(e => console.warn(e));
        const expirationText = blacklisted.permanent
            ? 'permanent'
            : `until <t:${Math.floor(blacklisted.expiration.getTime() / 1000)}:F>`;
        message.author.send(`Your latest attempt to count in ${message.guild.name} was blocked because you are blacklisted from the counting channel for the following reason: ${blacklisted.reason}. This is ${expirationText}.`)
            .catch(e => console.warn(e));
        return;
    }
    
    const text = message.content.trim();
    
    if (text.toLowerCase().includes('0x')) {
        const botReply = await message.channel.send(`<@${message.author.id}> only numbers and math expressions are allowed here!`);
        await message.delete().catch(e => console.warn(e));
        botReply.delete().catch(e => console.warn(e));
        return;
    }
    
    let numberInText;
    try {
        numberInText = evaluate(text);
    } catch (error) {
        const botReply = await message.channel.send(`<@${message.author.id}> invalid mathematical expression!`);
        await message.delete().catch(e => console.warn(e));
        botReply.delete().catch(e => console.warn(e));
        return;
    };
    
    if (isNaN(numberInText) || !isFinite(numberInText)) {
        const botReply = await message.channel.send(`<@${message.author.id}> only valid numbers and expressions are allowed!`);
        await message.delete().catch(e => console.warn(e));
        botReply.delete().catch(e => console.warn(e));
        return;
    };
    
    if (numberInText < 0) {
        const botReply = await message.channel.send(`<@${message.author.id}> only whole numbers above 0 are allowed!`);
        await message.delete().catch(e => console.warn(e));
        botReply.delete().catch(e => console.warn(e));
        return;
    };
    
    if (!Number.isInteger(numberInText)) {
        const botReply = await message.channel.send(`<@${message.author.id}> only whole numbers are allowed!`);
        await message.delete().catch(e => console.warn(e));
        botReply.delete().catch(e => console.warn(e));
        return;
    };
    
    if (message.author.id === guild.lastCompetetiveSender) {
        await message.channel.send(`<@${message.author.id}> tried to count twice!\nThe count has been restarted.\n**The next number is 1.**`).catch(console.warn);
        guild.lastCompetetiveSender = '0';
        guild.nextCompetetiveNumber = 1;
        await guild.save();
        return;
    };
    
    if (numberInText === guild.nextCompetetiveNumber) {
        guild.nextCompetetiveNumber++;
        guild.lastCompetetiveSender = message.author.id;
        await guild.save();
        message.react('✅').catch(e => console.warn(e));
    } else {
        await message.channel.send(
            `<@${message.author.id}>, ${numberInText} was the incorrect number!\nThe correct number was **${guild.nextCompetetiveNumber}**.\nThe count has been restarted.\n**The next number is 1.**`
        ).catch(console.warn);
        guild.lastCompetetiveSender = '0';
        guild.nextCompetetiveNumber = 1;
        await guild.save();
    };
};
