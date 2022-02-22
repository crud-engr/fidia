const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const DB =
            process.env.NODE_ENV === 'development'
                ? process.env.MONGO_URI
                : process.env.MONGO_URI_LIVE;

        const conn = await mongoose.connect(DB);
        console.log(`Mongodb connected: ${conn.connections[0].host}`);
    } catch (err) {
        console.log(`db connection error: ${err.message}`);
    }
};

module.exports = { connectDB };
