const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const guildSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    countingChannel: {
        type: String,
        required: true
    },
    notMath: {
        type: String,
        default: 'DELETE',
        enum: ['IGNORE', 'DELETE', 'RESTART']
    },
    notWholeNumber: {
        type: String,
        default: 'DELETE',
        enum: ['IGNORE', 'DELETE', 'RESTART']
    },
    wasLastSender: {
        type: String,
        default: 'RESTART',
        enum: ['ALLOW', 'IGNORE', 'DELETE', 'RESTART']
    },
    incorrectNumber: {
        type: String,
        default: 'RESTART',
        enum: ['IGNORE', 'DELETE', 'RESTART']
    },
    nextNumber: {
        type: Number,
        default: 1,
    },
    lastSender: {
        type: String,
        default: '0'
    }
});

module.exports = mongoose.model('guilds', guildSchema);