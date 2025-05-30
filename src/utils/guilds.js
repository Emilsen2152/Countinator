const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const guildSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    countingChannel: {
        type: String,
        default: '0'
    },
    incorrectNumber: {
        type: String,
        default: 'RESTART',
        enum: ['IGNORE', 'DELETE', 'RESTART']
    },
    wasLastSender: {
        type: String,
        default: 'RESTART',
        enum: ['ALLOW', 'IGNORE', 'DELETE', 'RESTART']
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
    nextNumber: {
        type: Number,
        default: 1,
    },
    lastSender: {
        type: String,
        default: '0'
    },
    competitiveChannel: {
        type: String, 
        default: '0'
    },
    nextCompetitiveNumber: {
        type: Number,
        default: 1
    },
    lastCompetitiveSender: {
        type: String,
        default: '0'
    },
});

module.exports = mongoose.model('guilds', guildSchema);