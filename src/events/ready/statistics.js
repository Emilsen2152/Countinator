module.exports = (client) => {
    client.guilds.cache.forEach(guild => {
        console.log(`${guild.name} | ${guild.id}`);
    })
};