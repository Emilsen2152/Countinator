const blacklist = require('../../utils/countingBlacklist.js');

module.exports = async (client) => {
    setInterval(async () => {
        const blacklisted = await blacklist.find({
            expiration: { $lt: Date.now() },
            permanent: false
        }).exec();

        for (const blacklistedUser of blacklisted) {
            if (blacklistedUser.expiration < Date.now() && !blacklistedUser.permanent) {
                await blacklistedUser.deleteOne();
                const user = await client.users.fetch(blacklistedUser.discordId);
                const guild = client.guilds.cache.get(blacklistedUser.guildId);
                user.send(`Your blacklist from the counting channel in ${guild.name} has expired.`).catch(e => {
                    console.warn(e);
                });
            };
        };
    }, 60000);
};