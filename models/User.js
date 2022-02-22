const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        mobileNumber: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            required: true,
        },
    },
    { timestamp: true }
);

UserSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

UserSchema.methods.validatePassword = async function (
    inputPassword,
    storedPassword
) {
    return await bcrypt.compare(inputPassword, storedPassword);
};

module.exports = mongoose.model('User', UserSchema);
