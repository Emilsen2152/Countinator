const { ActivityType } = require('discord.js');

const status = [
    {
        name: 'on the calculator',
        type: ActivityType.Playing,
    },
    {
        name: 'the couting channel',
        type: ActivityType.Watching,
    }
];

module.exports = (client) => {
    console.log(`${client.user.tag} is online.`);

    setInterval(() => {
        const random = Math.floor(Math.random() * status.length);
        client.user.setActivity(status[random]);
    }, 10000);
};
