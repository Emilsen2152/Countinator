require('dotenv').config();
const { Client, IntentsBitField, Partials } = require('discord.js');
const mongoose = require('mongoose');
const { CommandKit } = require('commandkit');

const client = new Client({
    intents:[
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages
    ],
    partials: [
        Partials.Channel
    ]
});

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Mongo DB.');

    } catch (error) {
        console.log(`Mongo DB Error: ${error}`);
    }      
})();

new CommandKit({
    client,
    commandsPath: `${__dirname}/commands`,
    eventsPath: `${__dirname}/events`,
    /*validationsPath: `${__dirname}/validations`,*/
    devGuildIds: ['1051780690447962122'],
    devUserIds: ['935889950547771512'],
    //devRoleIds: ['DEV_ROLE_ID_1', 'DEV_ROLE_ID_2'],
    skipBuiltInValidations: false,
    bulkRegister: true,
});

client.login(process.env.TOKEN);
