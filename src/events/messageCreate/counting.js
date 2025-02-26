const guilds = require('../../utils/guilds');
const countingBlacklist = require('../../utils/countingBlacklist');
const { evaluate } = require('mathjs');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function handleError(message, guild, errorMsg, configKey, restart = true) {
    const mode = guild[configKey];
    if (mode === 'IGNORE') return;
    if (mode === 'DELETE') {
        const botReply = await message.channel.send(`<@${message.author.id}> ${errorMsg}`);
        await message.delete().catch(e => console.warn(e));
        await sleep(3000);
        await botReply.delete().catch(e => console.warn(e));
    } else if (mode === 'RESTART') {
        const restartText = restart
            ? `\nThe count has been restarted.\n**The next number is 1.**`
            : '';
        await message.channel.send(`<@${message.author.id}> ${errorMsg}${restartText}`).catch(console.warn);
        guild.lastSender = '0';
        guild.nextNumber = 1;
        await guild.save();
    }
}

module.exports = async (message) => {
    if (message.author.bot || !message.guild) return;

    // Fetch guild and blacklist concurrently
    const [guild, blacklisted] = await Promise.all([
        guilds.findOne({ guildId: message.guild.id }).exec(),
        countingBlacklist.findOne({ guildId: message.guild.id, discordId: message.author.id }).exec()
    ]);
    
    if (!guild || message.channel.id !== guild.countingChannel) return;
    
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
        await handleError(message, guild, 'only numbers and math expressions are allowed here!', 'notMath', true);
        return;
    }
    
    let numberInText;
    try {
        numberInText = evaluate(text);
    } catch (error) {
        await handleError(message, guild, 'invalid mathematical expression!', 'notMath', true);
        return;
    }
    
    if (isNaN(numberInText) || !isFinite(numberInText)) {
        await handleError(message, guild, 'only valid numbers and expressions are allowed!', 'notMath', true);
        return;
    }
    
    if (numberInText < 0) {
        await handleError(message, guild, 'only whole numbers above 0 are allowed!', 'notMath', true);
        return;
    }
    
    if (!Number.isInteger(numberInText)) {
        await handleError(message, guild, 'only whole numbers are allowed!', 'notWholeNumber', true);
        return;
    }
    
    if (message.author.id === guild.lastSender) {
        if (guild.wasLastSender === 'IGNORE') {
            return;
        } else if (guild.wasLastSender === 'DELETE') {
            await message.delete().catch(e => console.warn(e));
            return;
        } else if (guild.wasLastSender === 'RESTART') {
            await message.channel.send(
                `<@${message.author.id}> tried to count twice!\nThe count has been restarted.\n**The next number is 1.**`
            ).catch(console.warn);
            guild.lastSender = '0';
            guild.nextNumber = 1;
            await guild.save();
            return;
        }
    }
    
    if (numberInText === guild.nextNumber) {
        // Here we must update before reacting.
        guild.nextNumber++;
        guild.lastSender = message.author.id;
        await guild.save();
        message.react('✅').catch(e => console.warn(e));
    } else {
        if (guild.incorrectNumber === 'IGNORE') return;
        if (guild.incorrectNumber === 'DELETE') {
            await message.delete().catch(e => console.warn(e));
        } else if (guild.incorrectNumber === 'RESTART') {
            await message.channel.send(
                `<@${message.author.id}>, ${numberInText} was the incorrect number!\nThe correct number was **${guild.nextNumber}**.\nThe count has been restarted.\n**The next number is 1.**`
            ).catch(console.warn);
            guild.lastSender = '0';
            guild.nextNumber = 1;
            await guild.save();
        }
    }
};
