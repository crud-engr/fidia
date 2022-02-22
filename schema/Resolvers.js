const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const Email = require('../utils/email');
const { AuthenticationError } = require('apollo-server-core');

const resolvers = {
    Query: {
        async getAllUsers() {
            try {
                const users = await User.find().exec();
                return users;
            } catch (err) {
                throw new Error(err.message);
            }
        },
    },

    Mutation: {
        async signup(parent, args) {
            try {
                const newUser = args;
                // validate user
                const emailExists = await User.findOne({
                    email: newUser.email,
                }).exec();
                if (emailExists) {
                    throw new Error('Email already exists');
                }
                const phoneExists = await User.findOne({
                    mobileNumber: newUser.mobileNumber,
                }).exec();
                if (phoneExists) {
                    throw new Error('Phone already exists');
                }
                const finalUser = await User.create(newUser);
                // create token
                let tokenExpiryTime = moment().add(5, 'minutes');
                const verifyToken = crypto.randomBytes(32).toString('hex');
                let token = await EmailVerification.create({
                    user: finalUser._id,
                    verifyToken,
                    tokenExpiryTime,
                });
                // send verification mail to registered user
                let url = `http://localhost:8081/auth/${
                    token.verifyToken
                }-${Date.now()}-${token.user}/verifyEmail`;
                await new Email(newUser, url).sendVerificationMail();

                return 'Account created. Please check your email and verify to continue.';
            } catch (err) {
                throw new Error(err.message);
            }
        },

        async verifyEmail(parent, args) {
            try {
                const userId = args._id;
                // check used token
                const usedToken = await EmailVerification.findOne({
                    user: userId,
                    isUsed: true,
                });
                if (usedToken) {
                    throw new Error('Email already verified');
                }
                const foundUserVerifyToken = await EmailVerification.findOne({
                    user: userId,
                    isUsed: false,
                    tokenExpiryTime: { $gt: moment().format() },
                });
                if (!foundUserVerifyToken) {
                    throw new Error('Invalid user or token expired');
                }
                // activate user email
                await EmailVerification.findOneAndUpdate(
                    { user: userId, isUsed: false },
                    { user: userId, isUsed: true }
                ).exec();
                // verify user
                const updatedUser = await User.findOneAndUpdate(
                    { _id: userId, isVerified: false },
                    { _id: userId, isVerified: true }
                ).exec();
                // send verify successful mail
                let url = `http://localhost:8081/auth/${Date.now()}-${
                    updatedUser._id
                }/login`;
                await new Email(updatedUser, url).verificationSuccessMail();
                return 'Your email has been verified';
            } catch (err) {
                throw new Error(err.message);
            }
        },

        async resendToken(parent, args) {
            try {
                const userId = args._id;
                const oldUser = await User.findOne({ _id: userId }).exec();
                if (!oldUser) {
                    throw new Error('User not found');
                }
                let tokenExpiryTime = moment().add(5, 'minutes');
                const verifyToken = crypto.randomBytes(32).toString('hex');
                let token = await EmailVerification.findOneAndUpdate(
                    { user: userId },
                    {
                        user: userId,
                        verifyToken,
                        tokenExpiryTime,
                        isUsed: false,
                    }
                ).exec();
                // resend verification token to registered user
                let url = `http://localhost:8081/auth/${
                    token.verifyToken
                }-${Date.now()}-${token.user}/verifyEmail`;
                await new Email(oldUser, url).sendVerificationMail();

                return 'A token has been sent to your email. Please use it to verify your account.';
            } catch (err) {
                throw new Error(err.message);
            }
        },

        async login(parent, args) {
            try {
                const user = args;
                const foundUser = await User.findOne({
                    email: user.email,
                }).exec();
                if (!foundUser) {
                    throw new AuthenticationError('Invalid email');
                }
                // validate password
                const passwordValidity = await foundUser.validatePassword(
                    user.password,
                    foundUser.password
                );
                if (!passwordValidity) {
                    throw new AuthenticationError('Invalid password');
                }
                // is user verified
                const isUserVerified = await User.findOne({
                    email: foundUser.email,
                    isVerified: true,
                }).exec();
                if (!isUserVerified) {
                    throw new AuthenticationError(
                        'Please check your email and verify to log in.'
                    );
                }
                // generate token for user
                const token = jwt.sign(
                    { _id: user._id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN }
                );
                return token;
            } catch (err) {
                throw new Error(err.message);
            }
        },
    },
};

module.exports = { resolvers };
