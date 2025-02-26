const blacklist = require("../../utils/countingBlacklist.js");
const guilds = require("../../utils/guilds.js");

module.exports = (guild, client) => {
    blacklist.deleteMany({
        guildId: guild.id
    }).exec();
    guilds.deleteOne({
        guildId: guild.id
    }).exec();
};
