const express = require('express');
const { ApolloServer } = require('apollo-server-express');
// const {
//     ApolloServerPluginLandingPageGraphQLPlayground,
// } = require('apollo-server-core');
const logger = require('./logger/index');
const { typeDefs } = require('./schema/TypeDefs');
const { resolvers } = require('./schema/Resolvers');
const { connectDB } = require('./config/db');
require('dotenv').config();

// connect database
connectDB();

const app = express();
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET',
        'POST',
        'DELETE',
        'PATCH'
    );
    next();
});

// this IIFE starts the apollo server
(async () => {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        // plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    });

    await server.start();
    server.applyMiddleware({ app });
})();

// listen to incoming requests
const port = process.env.PORT || 8082;
app.listen(port, () => {
    logger.info(`SERVER RUNNING ON PORT: ${process.env.PORT}`);
});

module.exports = app;
