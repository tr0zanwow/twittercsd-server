const { ApolloServer, PubSub, withFilter } = require("apollo-server-express");
const express = require("express");
const pubsub = new PubSub();
var app = module.exports = express();

module.exports = {
    pubsub,
    withFilter,
    ApolloServer,
    app
}