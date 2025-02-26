const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const countingBlacklist = new Schema({
    guildId: {
        type: String,
        required: true
    },
    discordId: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    addedBy: {
        type: String,
        required: true
    },
    expiration: {
        type: Date,
        required: true
    },
    permanent: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('counting-blacklist', countingBlacklist, 'counting-blacklist');