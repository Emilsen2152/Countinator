const blacklist = require("../../utils/countingBlacklist.js");
const guilds = require("../../utils/guilds.js");

module.exports = (guild, client) => {
    console.log(`Left guild ${guild.name} (${
        guild.id
    })`);

    blacklist.deleteMany({
        guildId: guild.id
    }).exec();
    guilds.deleteOne({
        guildId: guild.id
    }).exec();
};
