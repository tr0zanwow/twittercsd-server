const { ApolloServer, PubSub, withFilter } = require("apollo-server-express");
const pubsub = new PubSub();

module.exports = {
    pubsub,
    withFilter,
    ApolloServer
}