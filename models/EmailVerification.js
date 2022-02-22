const mongoose = require('mongoose');

const EmailVerificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        verifyToken: {
            type: String,
            default: '',
        },
        tokenExpiryTime: {
            type: Date,
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamp: true }
);

module.exports = mongoose.model('EmailVerification', EmailVerificationSchema);
